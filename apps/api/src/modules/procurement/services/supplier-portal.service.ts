import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { hashPassword, verifyPassword } from '../../onboarding/utils/password.util';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services';
import {
  SupplierCatalogUpdateDto,
  SupplierLoginDto,
  SupplierPasswordResetDto,
  SupplierProfileUpdateDto,
  SupplierPurchaseOrderActionDto,
  SupplierSendMessageDto,
  SupplierUpdateDeliveryDto,
  SupplierUpdatePasswordDto,
} from '../dto';
import {
  PurchaseOrderEntity,
  PurchaseOrderStatus,
  SupplierEntity,
  SupplierItemEntity,
  SupplierMessageEntity,
  SupplierPurchaseOrderStatus,
} from '../entities';

@Injectable()
export class SupplierPortalService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(SupplierItemEntity)
    private readonly supplierItems: Repository<SupplierItemEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly purchaseOrders: Repository<PurchaseOrderEntity>,
    @InjectRepository(SupplierMessageEntity)
    private readonly messages: Repository<SupplierMessageEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async login(tenant: TenantContext, dto: SupplierLoginDto) {
    const supplier = await this.suppliers
      .createQueryBuilder('supplier')
      .addSelect('supplier.portalPasswordHash')
      .where('supplier.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .andWhere('supplier.portal_user_email = :email', { email: this.normalizeEmail(dto.email) })
      .andWhere('supplier.is_active = TRUE')
      .getOne();

    if (!supplier?.portalPasswordHash || !(await verifyPassword(dto.password, supplier.portalPasswordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    supplier.lastLoginAt = new Date();
    await this.suppliers.save(supplier);
    return this.issueTokens(supplier);
  }

  async requestPasswordReset(tenant: TenantContext, dto: SupplierPasswordResetDto): Promise<void> {
    const supplier = await this.suppliers.findOne({
      where: { tenantId: tenant.tenantId, portalUserEmail: this.normalizeEmail(dto.email), isActive: true },
    });
    if (!supplier?.portalUserEmail) return;
    await this.notifySupplier(tenant.tenantId, supplier, 'Supplier portal password reset', 'A password reset was requested for your supplier portal account.');
  }

  async getProfile(tenant: TenantContext, supplierId: string) {
    return this.toSupplierProfile(await this.requireSupplier(tenant.tenantId, supplierId));
  }

  async updateProfile(tenant: TenantContext, supplierId: string, dto: SupplierProfileUpdateDto) {
    const supplier = await this.requireSupplier(tenant.tenantId, supplierId);
    if (dto.contactName !== undefined) supplier.contactName = dto.contactName.trim() || null;
    if (dto.email !== undefined) supplier.email = this.normalizeEmail(dto.email);
    if (dto.phone !== undefined) supplier.phone = dto.phone.trim() || null;
    return this.toSupplierProfile(await this.suppliers.save(supplier));
  }

  async updatePassword(tenant: TenantContext, supplierId: string, dto: SupplierUpdatePasswordDto) {
    const supplier = await this.suppliers
      .createQueryBuilder('supplier')
      .addSelect('supplier.portalPasswordHash')
      .where('supplier.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .andWhere('supplier.id = :supplierId', { supplierId })
      .andWhere('supplier.is_active = TRUE')
      .getOne();
    if (!supplier?.portalPasswordHash || !(await verifyPassword(dto.currentPassword, supplier.portalPasswordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    supplier.portalPasswordHash = await hashPassword(dto.newPassword);
    await this.suppliers.save(supplier);
    return this.toSupplierProfile(supplier);
  }

  async listPurchaseOrders(tenant: TenantContext, supplierId: string) {
    return this.purchaseOrders.find({
      where: { tenantId: tenant.tenantId, supplierId, status: Not(PurchaseOrderStatus.DRAFT) },
      relations: { supplier: true, location: true, items: { item: true } },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getDashboard(tenant: TenantContext, supplierId: string) {
    const [orders, messages, catalog] = await Promise.all([
      this.listPurchaseOrders(tenant, supplierId),
      this.listMessages(tenant, supplierId),
      this.listCatalog(tenant, supplierId),
    ]);
    const receivedOrders = orders.filter((order) => order.status === PurchaseOrderStatus.RECEIVED);
    const onTimeOrders = receivedOrders.filter((order) =>
      !order.expectedDeliveryDate || (order.receivedAt && order.receivedAt <= new Date(order.expectedDeliveryDate)),
    );
    const confirmedOrders = orders.filter((order) => order.supplierStatus === SupplierPurchaseOrderStatus.CONFIRMED);

    return {
      profile: await this.getProfile(tenant, supplierId),
      metrics: {
        pendingPOs: orders.filter((order) => order.supplierStatus === SupplierPurchaseOrderStatus.PENDING).length,
        confirmedPOs: confirmedOrders.length,
        rejectedPOs: orders.filter((order) => order.supplierStatus === SupplierPurchaseOrderStatus.REJECTED).length,
        shippedPOs: orders.filter((order) => order.supplierStatus === SupplierPurchaseOrderStatus.SHIPPED).length,
        unreadMessages: messages.filter((message) => message.senderType === 'merchant').length,
        onTimeDeliveryRate: receivedOrders.length ? Number(((onTimeOrders.length / receivedOrders.length) * 100).toFixed(2)) : 0,
        fillRate: this.fillRate(orders),
        averageConfirmationHours: this.averageConfirmationHours(confirmedOrders),
        leadTimeAccuracyDays: this.leadTimeAccuracyDays(receivedOrders),
        suppliedItems: catalog.length,
      },
      recentPurchaseOrders: orders.slice(0, 6),
      recentMessages: messages.slice(0, 6),
    };
  }

  async confirmPurchaseOrder(tenant: TenantContext, supplierId: string, dto: SupplierPurchaseOrderActionDto) {
    const order = await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, dto.purchaseOrderId);
    if ([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Closed purchase orders cannot be confirmed');
    }
    order.supplierStatus = SupplierPurchaseOrderStatus.CONFIRMED;
    order.supplierExpectedDeliveryDate = dto.expectedDeliveryDate ?? order.expectedDeliveryDate;
    order.expectedDeliveryDate = dto.expectedDeliveryDate ?? order.expectedDeliveryDate;
    order.supplierNotes = dto.notes ?? order.supplierNotes;
    const saved = await this.purchaseOrders.save(order);
    await this.createSystemMessage(tenant.tenantId, supplierId, order.id, `Supplier confirmed PO ${order.id}.`);
    await this.notifyMerchant(tenant.tenantId, saved, 'confirmed');
    return this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, order.id);
  }

  async rejectPurchaseOrder(tenant: TenantContext, supplierId: string, dto: SupplierPurchaseOrderActionDto) {
    const order = await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, dto.purchaseOrderId);
    if ([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Closed purchase orders cannot be rejected');
    }
    order.supplierStatus = SupplierPurchaseOrderStatus.REJECTED;
    order.supplierNotes = dto.notes ?? order.supplierNotes;
    const saved = await this.purchaseOrders.save(order);
    await this.createSystemMessage(tenant.tenantId, supplierId, order.id, `Supplier rejected PO ${order.id}.`);
    await this.notifyMerchant(tenant.tenantId, saved, 'rejected');
    return this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, order.id);
  }

  async updateDelivery(tenant: TenantContext, supplierId: string, dto: SupplierUpdateDeliveryDto) {
    const order = await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, dto.purchaseOrderId);
    if ([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status)) {
      throw new BadRequestException('Closed purchase orders cannot be updated');
    }
    order.supplierExpectedDeliveryDate = dto.expectedDeliveryDate;
    order.expectedDeliveryDate = dto.expectedDeliveryDate;
    order.supplierNotes = dto.notes ?? order.supplierNotes;
    const saved = await this.purchaseOrders.save(order);
    await this.createSystemMessage(tenant.tenantId, supplierId, order.id, `Expected delivery updated to ${dto.expectedDeliveryDate}.`);
    await this.notifyMerchant(tenant.tenantId, saved, 'updated expected delivery');
    return this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, order.id);
  }

  async markShipped(tenant: TenantContext, supplierId: string, dto: SupplierPurchaseOrderActionDto) {
    const order = await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, dto.purchaseOrderId);
    if (order.supplierStatus === SupplierPurchaseOrderStatus.REJECTED) {
      throw new BadRequestException('Rejected purchase orders cannot be shipped');
    }
    order.supplierStatus = SupplierPurchaseOrderStatus.SHIPPED;
    order.supplierNotes = dto.notes ?? order.supplierNotes;
    const saved = await this.purchaseOrders.save(order);
    await this.createSystemMessage(tenant.tenantId, supplierId, order.id, `Supplier marked PO ${order.id} as shipped.`);
    await this.notifyMerchant(tenant.tenantId, saved, 'shipped');
    return this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, order.id);
  }

  async listMessages(tenant: TenantContext, supplierId: string, purchaseOrderId?: string) {
    if (purchaseOrderId) {
      await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, purchaseOrderId);
    }
    return this.messages.find({
      where: {
        tenantId: tenant.tenantId,
        supplierId,
        ...(purchaseOrderId ? { purchaseOrderId } : {}),
      },
      relations: { purchaseOrder: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async sendSupplierMessage(tenant: TenantContext, supplierId: string, dto: SupplierSendMessageDto) {
    if (dto.purchaseOrderId) {
      await this.requireSupplierPurchaseOrder(tenant.tenantId, supplierId, dto.purchaseOrderId);
    }
    const message = await this.messages.save(this.messages.create({
      tenantId: tenant.tenantId,
      supplierId,
      purchaseOrderId: dto.purchaseOrderId ?? null,
      senderType: 'supplier',
      message: dto.message.trim(),
    }));
    await this.notifyMerchant(tenant.tenantId, { id: dto.purchaseOrderId ?? null, supplierId } as PurchaseOrderEntity, 'message received');
    return message;
  }

  async sendMerchantMessage(tenantId: string, supplierId: string, dto: SupplierSendMessageDto) {
    await this.requireSupplier(tenantId, supplierId);
    if (dto.purchaseOrderId) {
      await this.requireSupplierPurchaseOrder(tenantId, supplierId, dto.purchaseOrderId);
    }
    const message = await this.messages.save(this.messages.create({
      tenantId,
      supplierId,
      purchaseOrderId: dto.purchaseOrderId ?? null,
      senderType: 'merchant',
      message: dto.message.trim(),
    }));
    const supplier = await this.requireSupplier(tenantId, supplierId);
    await this.notifySupplier(tenantId, supplier, 'New supplier portal message', dto.message.trim());
    return message;
  }

  async listCatalog(tenant: TenantContext, supplierId: string) {
    await this.requireSupplier(tenant.tenantId, supplierId);
    return this.supplierItems.find({
      where: { supplierId, supplier: { tenantId: tenant.tenantId } },
      relations: { item: true, supplier: true },
      order: { itemId: 'ASC' },
    });
  }

  async updateCatalog(tenant: TenantContext, supplierId: string, dto: SupplierCatalogUpdateDto) {
    const item = await this.supplierItems.findOne({
      where: { id: dto.supplierItemId, supplierId, supplier: { tenantId: tenant.tenantId } },
      relations: { item: true, supplier: true },
    });
    if (!item) throw new NotFoundException('Supplier catalog item not found');
    const oldCostPrice = item.costPrice;
    if (dto.costPrice !== undefined) item.costPrice = dto.costPrice.toFixed(2);
    if (dto.leadTimeDays !== undefined) item.leadTimeDays = dto.leadTimeDays;
    if (dto.minOrderQty !== undefined) item.minOrderQty = dto.minOrderQty;
    if (dto.sku !== undefined) item.sku = dto.sku.trim() || null;
    const saved = await this.supplierItems.save(item);
    if (oldCostPrice !== saved.costPrice) {
      await this.createSystemMessage(tenant.tenantId, supplierId, null, `Cost changed for ${item.item?.name ?? item.itemId}: ${oldCostPrice} -> ${saved.costPrice}.`);
    }
    return saved;
  }

  async adminOverview(tenantId: string) {
    const [suppliers, orders, messages] = await Promise.all([
      this.suppliers.find({ where: { tenantId }, relations: { items: true } }),
      this.purchaseOrders.find({ where: { tenantId }, relations: { supplier: true } }),
      this.messages.find({ where: { tenantId }, relations: { supplier: true, purchaseOrder: true }, order: { createdAt: 'DESC' }, take: 100 }),
    ]);

    return {
      suppliers: suppliers.map((supplier) => this.toAdminSupplier(supplier)),
      confirmations: orders
        .filter((order) => order.supplierStatus !== SupplierPurchaseOrderStatus.PENDING)
        .slice(0, 50),
      messages,
      performance: this.supplierPerformance(suppliers, orders),
    };
  }

  private async requireSupplier(tenantId: string, supplierId: string) {
    const supplier = await this.suppliers.findOne({ where: { tenantId, id: supplierId, isActive: true } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  private async requireSupplierPurchaseOrder(tenantId: string, supplierId: string, purchaseOrderId: string) {
    const order = await this.purchaseOrders.findOne({
      where: { id: purchaseOrderId, tenantId, supplierId },
      relations: { supplier: true, location: true, items: { item: true } },
    });
    if (!order) throw new NotFoundException('Purchase order not found');
    return order;
  }

  private async createSystemMessage(tenantId: string, supplierId: string, purchaseOrderId: string | null, message: string) {
    await this.messages.save(this.messages.create({
      tenantId,
      supplierId,
      purchaseOrderId,
      senderType: 'merchant',
      message,
    }));
  }

  private async issueTokens(supplier: SupplierEntity) {
    const accessToken = await this.jwtService.signAsync({
      sub: supplier.id,
      tenantId: supplier.tenantId,
      email: supplier.portalUserEmail,
      type: 'supplier',
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: supplier.id,
        tenantId: supplier.tenantId,
        type: 'supplier',
      },
      { expiresIn: this.config.get<string>('SUPPLIER_JWT_REFRESH_EXPIRES_IN', '30d') },
    );
    return {
      accessToken,
      refreshToken,
      supplierId: supplier.id,
      name: supplier.name,
    };
  }

  private toSupplierProfile(supplier: SupplierEntity) {
    return {
      id: supplier.id,
      tenantId: supplier.tenantId,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      portalUserEmail: supplier.portalUserEmail,
      lastLoginAt: supplier.lastLoginAt,
      isActive: supplier.isActive,
    };
  }

  private toAdminSupplier(supplier: SupplierEntity) {
    return {
      id: supplier.id,
      tenantId: supplier.tenantId,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes,
      portalUserEmail: supplier.portalUserEmail,
      lastLoginAt: supplier.lastLoginAt,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      items: supplier.items ?? [],
      portalEnabled: Boolean(supplier.portalUserEmail),
      itemsSupplied: supplier.items?.length ?? 0,
    };
  }

  private supplierPerformance(suppliers: SupplierEntity[], orders: PurchaseOrderEntity[]) {
    return suppliers.map((supplier) => {
      const supplierOrders = orders.filter((order) => order.supplierId === supplier.id);
      const received = supplierOrders.filter((order) => order.status === PurchaseOrderStatus.RECEIVED);
      const onTime = received.filter((order) =>
        !order.expectedDeliveryDate || (order.receivedAt && order.receivedAt <= new Date(order.expectedDeliveryDate)),
      );
      return {
        supplierId: supplier.id,
        name: supplier.name,
        portalEnabled: Boolean(supplier.portalUserEmail),
        purchaseOrders: supplierOrders.length,
        confirmations: supplierOrders.filter((order) => order.supplierStatus === SupplierPurchaseOrderStatus.CONFIRMED).length,
        delays: supplierOrders.filter((order) =>
          order.expectedDeliveryDate &&
          ![PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED].includes(order.status) &&
          new Date(order.expectedDeliveryDate) < new Date(),
        ).length,
        onTimeDeliveryRate: received.length ? Number(((onTime.length / received.length) * 100).toFixed(2)) : 0,
        fillRate: this.fillRate(supplierOrders),
      };
    });
  }

  private fillRate(orders: PurchaseOrderEntity[]) {
    const totals = orders.flatMap((order) => order.items ?? []).reduce(
      (sum, item) => ({
        ordered: sum.ordered + item.quantityOrdered,
        received: sum.received + item.quantityReceived,
      }),
      { ordered: 0, received: 0 },
    );
    return totals.ordered ? Number(((totals.received / totals.ordered) * 100).toFixed(2)) : 0;
  }

  private averageConfirmationHours(orders: PurchaseOrderEntity[]) {
    const values = orders
      .filter((order) => order.sentAt)
      .map((order) => (order.updatedAt?.getTime() ?? order.createdAt.getTime()) - order.sentAt!.getTime())
      .filter((value) => value >= 0);
    if (!values.length) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length / 3_600_000).toFixed(2));
  }

  private leadTimeAccuracyDays(orders: PurchaseOrderEntity[]) {
    const values = orders
      .filter((order) => order.supplierExpectedDeliveryDate && order.receivedAt)
      .map((order) => Math.abs(order.receivedAt!.getTime() - new Date(order.supplierExpectedDeliveryDate!).getTime()) / 86_400_000);
    if (!values.length) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
  }

  private async notifySupplier(tenantId: string, supplier: SupplierEntity, title: string, message: string) {
    const recipient = supplier.portalUserEmail ?? supplier.email;
    if (!recipient) return;
    try {
      await this.notifications.sendSystemNotification(tenantId, {
        type: NotificationType.SYSTEM,
        channel: NotificationChannelType.EMAIL,
        recipient,
        payload: { title, body: message, supplierId: supplier.id },
      });
    } catch {
      // Supplier notifications should not block portal workflows.
    }
  }

  private async notifyMerchant(tenantId: string, order: PurchaseOrderEntity, action: string) {
    try {
      await this.notifications.sendSystemNotification(tenantId, {
        type: NotificationType.SYSTEM,
        channel: NotificationChannelType.EMAIL,
        recipient: 'merchant',
        payload: {
          title: `Supplier ${action}`,
          body: `Supplier ${order.supplierId} ${action}${order.id ? ` purchase order ${order.id}` : ''}.`,
          purchaseOrderId: order.id,
          supplierId: order.supplierId,
        },
      });
    } catch {
      // Merchant notifications are best-effort for MVP portal actions.
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
