import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { InventoryService } from '../../inventory/services/inventory.service';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services';
import { TaxCalculationService } from '../../tax';
import { formatMoney, parseMoney } from '../../orders/domain/order-totals.util';
import { ReceivePurchaseOrderDto, UpsertPurchaseOrderDto } from '../dto';
import {
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  PurchaseOrderStatus,
  SupplierPurchaseOrderStatus,
  SupplierEntity,
  SupplierItemEntity,
} from '../entities';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private readonly purchaseOrders: Repository<PurchaseOrderEntity>,
    @InjectRepository(PurchaseOrderItemEntity)
    private readonly purchaseOrderItems: Repository<PurchaseOrderItemEntity>,
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(SupplierItemEntity)
    private readonly supplierItems: Repository<SupplierItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    private readonly inventoryService: InventoryService,
    private readonly notifications: NotificationsService,
    private readonly taxCalculation: TaxCalculationService,
  ) {}

  list(tenantId: string) {
    return this.purchaseOrders.find({
      where: { tenantId },
      relations: { supplier: true, location: true, items: { item: true } },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async get(tenantId: string, id: string) {
    const order = await this.purchaseOrders.findOne({
      where: { tenantId, id },
      relations: { supplier: true, location: true, items: { item: true } },
    });
    if (!order) throw new NotFoundException('Purchase order not found');
    return order;
  }

  async create(tenantId: string, dto: UpsertPurchaseOrderDto) {
    await this.assertSupplier(tenantId, dto.supplierId);
    const totals = await this.quoteTax(tenantId, dto.locationId, dto.items);
    const order = await this.purchaseOrders.save(this.purchaseOrders.create({
      tenantId,
      supplierId: dto.supplierId,
      locationId: dto.locationId,
      status: dto.status ?? PurchaseOrderStatus.DRAFT,
      supplierStatus: dto.supplierStatus ?? SupplierPurchaseOrderStatus.PENDING,
      subtotalCost: totals.subtotalCost,
      taxTotal: totals.taxTotal,
      totalCost: totals.totalCost,
      expectedDeliveryDate: dto.expectedDeliveryDate ?? null,
      supplierExpectedDeliveryDate: dto.supplierExpectedDeliveryDate ?? null,
      supplierNotes: dto.supplierNotes ?? null,
      sentAt: dto.status === PurchaseOrderStatus.SENT ? new Date() : null,
    }));
    await this.replaceItems(order.id, dto.items, totals.lineTaxByProductId);
    const saved = await this.get(tenantId, order.id);
    await this.notifySupplier(tenantId, saved, saved.status === PurchaseOrderStatus.SENT ? 'sent' : 'created');
    return saved;
  }

  async update(tenantId: string, dto: UpsertPurchaseOrderDto) {
    if (!dto.id) throw new NotFoundException('Purchase order not found');
    const order = await this.get(tenantId, dto.id);
    if ([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Received or cancelled purchase orders cannot be edited');
    }
    if ([SupplierPurchaseOrderStatus.CONFIRMED, SupplierPurchaseOrderStatus.SHIPPED].includes(order.supplierStatus)) {
      throw new BadRequestException('Supplier-confirmed purchase orders are locked');
    }
    await this.assertSupplier(tenantId, dto.supplierId);
    const totals = await this.quoteTax(tenantId, dto.locationId, dto.items);
    order.supplierId = dto.supplierId;
    order.locationId = dto.locationId;
    order.status = dto.status ?? order.status;
    order.supplierStatus = dto.supplierStatus ?? order.supplierStatus;
    order.subtotalCost = totals.subtotalCost;
    order.taxTotal = totals.taxTotal;
    order.totalCost = totals.totalCost;
    order.expectedDeliveryDate = dto.expectedDeliveryDate ?? null;
    order.supplierExpectedDeliveryDate = dto.supplierExpectedDeliveryDate ?? order.supplierExpectedDeliveryDate;
    order.supplierNotes = dto.supplierNotes ?? order.supplierNotes;
    order.sentAt = order.status === PurchaseOrderStatus.SENT && !order.sentAt ? new Date() : order.sentAt;
    await this.purchaseOrders.save(order);
    await this.replaceItems(order.id, dto.items, totals.lineTaxByProductId);
    const saved = await this.get(tenantId, order.id);
    if (saved.status === PurchaseOrderStatus.SENT) await this.notifySupplier(tenantId, saved, 'sent');
    return saved;
  }

  async receive(tenantId: string, dto: ReceivePurchaseOrderDto) {
    const order = await this.get(tenantId, dto.purchaseOrderId);
    if (order.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cancelled purchase orders cannot be received');
    }
    const receivedByLineId = new Map(dto.items.map((item) => [item.purchaseOrderItemId, item.quantityReceived]));
    let fullyReceived = true;
    let receivedAny = false;

    for (const line of order.items) {
      const quantity = receivedByLineId.get(line.id);
      if (quantity === undefined || quantity <= 0) {
        if (line.quantityReceived < line.quantityOrdered) fullyReceived = false;
        continue;
      }
      const remaining = line.quantityOrdered - line.quantityReceived;
      const accepted = Math.min(quantity, remaining);
      if (accepted <= 0) continue;
      line.quantityReceived += accepted;
      receivedAny = true;
      await this.purchaseOrderItems.save(line);
      await this.inventoryService.receiveStock({
        tenantId,
        locationId: order.locationId,
        productId: line.itemId,
        quantity: accepted,
        referenceId: order.id,
        notes: `Purchase order ${order.id}`,
      });
      if (line.quantityReceived < line.quantityOrdered) fullyReceived = false;
    }

    if (!receivedAny) {
      throw new BadRequestException('No receivable quantities were provided');
    }
    const freshLines = await this.purchaseOrderItems.find({ where: { purchaseOrderId: order.id } });
    fullyReceived = freshLines.every((line) => line.quantityReceived >= line.quantityOrdered);
    order.status = fullyReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIAL;
    order.receivedAt = fullyReceived ? new Date() : order.receivedAt;
    await this.purchaseOrders.save(order);
    const saved = await this.get(tenantId, order.id);
    await this.notifySupplier(tenantId, saved, 'received');
    return saved;
  }

  async analytics(tenantId: string) {
    const [orders, suppliers] = await Promise.all([
      this.purchaseOrders.find({ where: { tenantId }, relations: { supplier: true } }),
      this.suppliers.find({ where: { tenantId }, relations: { items: true } }),
    ]);
    const delayed = orders.filter((order) =>
      order.expectedDeliveryDate &&
      ![PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status) &&
      new Date(order.expectedDeliveryDate) < new Date(),
    ).length;
    const received = orders.filter((order) => order.status === PurchaseOrderStatus.RECEIVED);
    const onTime = received.filter((order) =>
      !order.expectedDeliveryDate || (order.receivedAt && order.receivedAt <= new Date(order.expectedDeliveryDate)),
    ).length;
    const topSuppliers = suppliers.map((supplier) => ({
      supplierId: supplier.id,
      name: supplier.name,
      itemsSupplied: supplier.items?.length ?? 0,
      purchaseOrders: orders.filter((order) => order.supplierId === supplier.id).length,
      volume: orders
        .filter((order) => order.supplierId === supplier.id)
        .reduce((sum, order) => sum + Number(order.totalCost), 0)
        .toFixed(2),
    })).sort((a, b) => Number(b.volume) - Number(a.volume));
    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter((supplier) => supplier.isActive).length,
      openPurchaseOrders: orders.filter((order) => ![PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status)).length,
      delayedOrders: delayed,
      onTimeDeliveryRate: received.length ? Number(((onTime / received.length) * 100).toFixed(2)) : 0,
      topSuppliers,
    };
  }

  async reorderSuggestions(tenantId: string) {
    const supplierItems = await this.supplierItems.find({ relations: { supplier: true, item: true }, where: { supplier: { tenantId } } });
    return supplierItems.slice(0, 50).map((item) => ({
      supplierId: item.supplierId,
      supplierName: item.supplier?.name ?? 'Supplier',
      itemId: item.itemId,
      itemName: item.item?.name ?? 'Catalog item',
      suggestedQty: Math.max(item.minOrderQty, Math.ceil((item.leadTimeDays || 1) * 2)),
      reason: 'Lead time and minimum order quantity',
    }));
  }

  private async assertSupplier(tenantId: string, supplierId: string) {
    const supplier = await this.suppliers.findOne({ where: { tenantId, id: supplierId, isActive: true } });
    if (!supplier) throw new BadRequestException('Supplier is not active or does not exist');
  }

  private async replaceItems(
    orderId: string,
    items: UpsertPurchaseOrderDto['items'],
    lineTaxByProductId: Map<string, {
      taxCategoryId: string | null;
      taxRuleId: string | null;
      priceMode: 'inclusive' | 'exclusive';
      taxRate: string;
      taxableAmount: string;
      taxAmount: string;
    }>,
  ) {
    await this.purchaseOrderItems.delete({ purchaseOrderId: orderId });
    await this.purchaseOrderItems.save(items.map((item) => this.purchaseOrderItems.create({
      purchaseOrderId: orderId,
      itemId: item.itemId,
      quantityOrdered: item.quantityOrdered,
      quantityReceived: 0,
      costPrice: item.costPrice.toFixed(2),
      taxCategoryId: lineTaxByProductId.get(item.itemId)?.taxCategoryId ?? null,
      taxRuleId: lineTaxByProductId.get(item.itemId)?.taxRuleId ?? null,
      priceMode: lineTaxByProductId.get(item.itemId)?.priceMode ?? 'inclusive',
      taxRate: lineTaxByProductId.get(item.itemId)?.taxRate ?? '0.0000',
      taxableAmount: lineTaxByProductId.get(item.itemId)?.taxableAmount ?? '0.00',
      taxAmount: lineTaxByProductId.get(item.itemId)?.taxAmount ?? '0.00',
    })));
  }

  private async quoteTax(tenantId: string, locationId: string, items: UpsertPurchaseOrderDto['items']) {
    const products = await this.products.find({ where: { tenantId, id: In(items.map((item) => item.itemId)) } });
    const productById = new Map(products.map((product) => [product.id, product]));
    const lines = items.map((item) => {
      const product = productById.get(item.itemId);
      const lineSubtotal = formatMoney(item.quantityOrdered * item.costPrice);
      return {
        productId: item.itemId,
        categoryId: product?.categoryId ?? null,
        taxCategoryId: product?.taxCategoryId ?? null,
        variantId: null,
        quantity: item.quantityOrdered,
        unitPrice: formatMoney(item.costPrice),
        modifierTotal: '0.00',
        unitPriceWithModifiers: formatMoney(item.costPrice),
        lineSubtotal,
        lineTax: '0.00',
        lineDiscount: '0.00',
        notes: null,
        modifiers: [],
      };
    });
    const tax = await this.taxCalculation.calculateOrderTax({
      tenant: { tenantId, source: 'header' },
      locationId,
      lines,
      discountTotal: '0.00',
      deliveryFee: '0.00',
      serviceChargeTotal: '0.00',
    });
    const grossCost = items.reduce((sum, item) => sum + item.quantityOrdered * item.costPrice, 0);
    const taxableCost = tax.lines.length
      ? tax.lines.reduce((sum, line) => sum + parseMoney(line.taxableAmount), 0)
      : grossCost;
    return {
      subtotalCost: formatMoney(taxableCost),
      taxTotal: tax.taxTotal,
      totalCost: formatMoney(grossCost + parseMoney(tax.chargeableTaxTotal)),
      lineTaxByProductId: new Map(
        tax.lines
          .filter((line) => line.productId)
          .map((line) => [
            line.productId!,
            {
              taxCategoryId: line.taxCategoryId,
              taxRuleId: line.taxRuleId,
              priceMode: line.priceMode,
              taxRate: line.taxRate,
              taxableAmount: line.taxableAmount,
              taxAmount: line.taxAmount,
            },
          ]),
      ),
    };
  }

  private async notifySupplier(
    tenantId: string,
    order: PurchaseOrderEntity,
    event: 'created' | 'sent' | 'received',
  ) {
    const recipient = order.supplier?.email;
    if (!recipient) return;
    try {
      await this.notifications.sendSystemNotification(tenantId, {
        type: NotificationType.SYSTEM,
        channel: NotificationChannelType.EMAIL,
        recipient,
        payload: {
          templateName: `purchase_order_${event}`,
          subject: `Purchase order ${event}`,
          body: `Purchase order ${order.id} was ${event}. Total cost: ${order.totalCost}.`,
          purchaseOrderId: order.id,
          supplierId: order.supplierId,
          totalCost: order.totalCost,
        },
      });
    } catch {
      // Notification delivery must not block stock receiving or PO state changes.
    }
  }
}
