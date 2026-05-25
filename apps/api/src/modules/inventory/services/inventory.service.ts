import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { StockItemEntity } from '../entities/stock-item.entity';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { StockMovementSource } from '../enums/stock-movement-source.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';
import { StockAdjustmentType } from '../enums/stock-adjustment-type.enum';
import {
  addQty,
  availableQty,
  formatQty,
  parseQty,
  subtractQty,
} from '../domain/stock-quantity.util';
import {
  throwInsufficientStock,
  throwInventoryItemNotFound,
  throwInvalidAdjustmentDelta,
  throwNegativeStock,
  throwInsufficientReserved,
  throwOverDeduction,
  throwOverReservation,
} from '../domain/inventory-domain.errors';
import { AdjustStockDto } from '../dto/inventory/adjust-stock.dto';
import { StockItemRepository } from '../repositories/stock-item.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { StockAdjustmentRepository } from '../repositories/stock-adjustment.repository';
import { StockReservationRepository } from '../repositories/stock-reservation.repository';
import { InventoryOrderContext } from '../types/inventory-order.context';
import {
  InventoryDeductResult,
  InventoryReserveResult,
  InventoryStockView,
  ReceiveStockInput,
  RecordMovementInput,
} from '../types/inventory-stock.types';
import {
  AutoReplenishmentService,
  LowStockAlertsService,
  SupplierOrderingService,
} from '../integrations';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly stockItemRepository: StockItemRepository,
    private readonly stockMovementRepository: StockMovementRepository,
    private readonly stockAdjustmentRepository: StockAdjustmentRepository,
    private readonly stockReservationRepository: StockReservationRepository,
    private readonly lowStockAlertsService: LowStockAlertsService,
    private readonly autoReplenishmentService: AutoReplenishmentService,
    private readonly supplierOrderingService: SupplierOrderingService,
  ) {}

  async getStock(
    tenantId: string,
    productId: string,
    locationId: string,
  ): Promise<InventoryStockView> {
    const item = await this.stockItemRepository.findByProductForTenant(
      tenantId,
      locationId,
      productId,
    );
    if (!item) {
      throwInventoryItemNotFound(productId, locationId);
    }
    return this.toStockView(item);
  }

  async reserve(context: InventoryOrderContext): Promise<InventoryReserveResult> {
    return this.dataSource.transaction((manager) => this.reserveInTransaction(context, manager));
  }

  async deduct(context: InventoryOrderContext): Promise<InventoryDeductResult> {
    return this.dataSource.transaction((manager) => this.deductInTransaction(context, manager));
  }

  async releaseOrRestore(context: InventoryOrderContext): Promise<void> {
    await this.dataSource.transaction((manager) =>
      this.releaseOrRestoreInTransaction(context, manager),
    );
  }

  async restoreForRefund(context: InventoryOrderContext): Promise<void> {
    await this.dataSource.transaction((manager) =>
      this.restoreForRefundInTransaction(context, manager),
    );
  }

  async adjustStock(tenantId: string, dto: AdjustStockDto): Promise<InventoryStockView> {
    if (dto.delta === 0) {
      throwInvalidAdjustmentDelta(dto.delta);
    }

    return this.dataSource.transaction(async (manager) => {
      const item = await this.stockItemRepository.findByIdForTenant(
        tenantId,
        dto.stockItemId,
        manager,
        true,
      );
      if (!item) {
        throw new BadRequestException(`Stock item ${dto.stockItemId} not found`);
      }
      if (item.locationId !== dto.locationId) {
        throw new BadRequestException('locationId does not match stock item');
      }

      const nextOnHand = addQty(item.quantityOnHand, dto.delta);
      if (parseQty(nextOnHand) < 0) {
        throwNegativeStock(item.sku, 'quantityOnHand');
      }

      item.quantityOnHand = nextOnHand;
      await this.stockItemRepository.save(item, manager);

      await this.stockAdjustmentRepository.append(
        {
          tenantId,
          stockItemId: item.id,
          locationId: dto.locationId,
          type: dto.type,
          quantityDelta: formatQty(dto.delta),
          reason: dto.reason ?? null,
          adjustedBy: dto.userId ?? null,
        },
        manager,
      );

      await this.recordMovement(
        {
          tenantId,
          stockItemId: item.id,
          type: StockMovementType.ADJUSTMENT,
          delta: dto.delta,
          source: StockMovementSource.ADJUSTMENT,
          notes: dto.reason ?? null,
        },
        manager,
      );

      this.runIntegrationHooks(item);
      return this.toStockView(item);
    });
  }

  async receiveStock(input: ReceiveStockInput): Promise<InventoryStockView> {
    this.assertLineQuantity(input.quantity);

    return this.dataSource.transaction(async (manager) => {
      let item = await this.stockItemRepository.findByProductForTenant(
        input.tenantId,
        input.locationId,
        input.productId,
        manager,
        true,
      );

      if (!item) {
        const product = await manager.getRepository(ProductEntity).findOne({
          where: { id: input.productId, tenantId: input.tenantId },
        });
        if (!product) {
          throwInventoryItemNotFound(input.productId, input.locationId);
        }
        item = this.stockItemRepository.create(
          {
            tenantId: input.tenantId,
            locationId: input.locationId,
            productId: input.productId,
            name: input.name ?? product.name,
            sku: input.sku ?? product.sku ?? product.id.slice(0, 8),
            unit: 'each',
            quantityOnHand: '0.0000',
            quantityReserved: '0.0000',
            reorderLevel: null,
            isActive: true,
          },
          manager,
        );
      }

      item.quantityOnHand = addQty(item.quantityOnHand, input.quantity);
      item.lastReceivedAt = new Date();
      await this.stockItemRepository.save(item, manager);

      await this.recordMovement(
        {
          tenantId: input.tenantId,
          stockItemId: item.id,
          type: StockMovementType.IN,
          delta: input.quantity,
          source: StockMovementSource.PURCHASE_ORDER,
          referenceType: StockReferenceType.PURCHASE_ORDER,
          referenceId: input.referenceId ?? null,
          notes: input.notes ?? null,
        },
        manager,
      );

      this.runIntegrationHooks(item);
      return this.toStockView(item);
    });
  }

  async recordMovement(
    input: RecordMovementInput,
    manager?: EntityManager,
  ): Promise<string> {
    const absQuantity = formatQty(Math.abs(input.delta));
    const movement = await this.stockMovementRepository.append(
      {
        tenantId: input.tenantId,
        stockItemId: input.stockItemId,
        type: input.type,
        quantity: absQuantity,
        source: input.source,
        referenceType: input.referenceType ?? (input.orderId ? StockReferenceType.ORDER : null),
        referenceId: input.referenceId ?? input.orderId ?? null,
        notes: input.notes ?? null,
      },
      manager,
    );
    return movement.id;
  }

  private mergeLines(context: InventoryOrderContext): InventoryOrderContext['lines'] {
    const totals = new Map<string, number>();
    for (const line of context.lines) {
      totals.set(line.productId, (totals.get(line.productId) ?? 0) + line.quantity);
    }
    return [...totals.entries()].map(([productId, quantity]) => ({ productId, quantity }));
  }

  private async reserveInTransaction(
    context: InventoryOrderContext,
    manager: EntityManager,
  ): Promise<InventoryReserveResult> {
    const reservationIds: string[] = [];
    const lines = this.mergeLines(context);

    for (const line of lines) {
      this.assertLineQuantity(line.quantity);

      const existing = await this.stockReservationRepository.findActiveForOrderAndProduct(
        context.tenantId,
        context.orderId,
        (await this.requireStockItem(context, line.productId, manager)).id,
        manager,
      );
      if (existing) {
        reservationIds.push(existing.id);
        continue;
      }

      const item = await this.requireStockItem(context, line.productId, manager, true);
      const available = availableQty(item.quantityOnHand, item.quantityReserved);

      if (line.quantity > available) {
        throwOverReservation(item.sku, available, line.quantity);
      }

      item.quantityReserved = addQty(item.quantityReserved, line.quantity);
      this.assertNonNegative(item);

      const reservation = await this.stockReservationRepository.create(
        {
          tenantId: context.tenantId,
          stockItemId: item.id,
          locationId: context.locationId,
          quantity: formatQty(line.quantity),
          referenceType: StockReferenceType.ORDER,
          referenceId: context.orderId,
        },
        manager,
      );

      await this.stockItemRepository.save(item, manager);

      const movementId = await this.recordMovement(
        {
          tenantId: context.tenantId,
          stockItemId: item.id,
          type: StockMovementType.RESERVATION,
          delta: line.quantity,
          source: StockMovementSource.ORDER,
          orderId: context.orderId,
        },
        manager,
      );

      reservationIds.push(reservation.id);
      void movementId;
    }

    return { reservationIds };
  }

  private async deductInTransaction(
    context: InventoryOrderContext,
    manager: EntityManager,
  ): Promise<InventoryDeductResult> {
    const movementIds: string[] = [];
    const lines = this.mergeLines(context);

    for (const line of lines) {
      this.assertLineQuantity(line.quantity);

      const item = await this.requireStockItem(context, line.productId, manager, true);
      const reserved = parseQty(item.quantityReserved);
      const onHand = parseQty(item.quantityOnHand);

      if (line.quantity > reserved) {
        throwInsufficientReserved(item.sku, reserved, line.quantity);
      }
      if (line.quantity > onHand) {
        throwOverDeduction(item.sku, onHand, line.quantity);
      }

      item.quantityOnHand = subtractQty(item.quantityOnHand, line.quantity);
      item.quantityReserved = subtractQty(item.quantityReserved, line.quantity);
      this.assertNonNegative(item);

      await this.stockItemRepository.save(item, manager);

      const movementId = await this.recordMovement(
        {
          tenantId: context.tenantId,
          stockItemId: item.id,
          type: StockMovementType.DEDUCTION,
          delta: -line.quantity,
          source: StockMovementSource.ORDER,
          orderId: context.orderId,
        },
        manager,
      );

      movementIds.push(movementId);
      this.runIntegrationHooks(item);
    }

    await this.stockReservationRepository.fulfillActiveForOrder(
      context.tenantId,
      context.orderId,
      manager,
    );

    return { movementIds };
  }

  private async releaseOrRestoreInTransaction(
    context: InventoryOrderContext,
    manager: EntityManager,
  ): Promise<void> {
    const active = await this.stockReservationRepository.findActiveForOrder(
      context.tenantId,
      context.orderId,
      manager,
    );

    if (active.length === 0) {
      return;
    }

    for (const reservation of active) {
      const item = await this.stockItemRepository.findByIdForTenant(
        context.tenantId,
        reservation.stockItemId,
        manager,
        true,
      );
      if (!item) {
        continue;
      }

      const qty = parseQty(reservation.quantity);
      item.quantityReserved = subtractQty(item.quantityReserved, qty);
      this.assertNonNegative(item);
      await this.stockItemRepository.save(item, manager);

      await this.recordMovement(
        {
          tenantId: context.tenantId,
          stockItemId: item.id,
          type: StockMovementType.RELEASE,
          delta: -qty,
          source: StockMovementSource.ORDER,
          orderId: context.orderId,
        },
        manager,
      );
    }

    await this.stockReservationRepository.releaseActiveForOrder(
      context.tenantId,
      context.orderId,
      manager,
    );
  }

  private async restoreForRefundInTransaction(
    context: InventoryOrderContext,
    manager: EntityManager,
  ): Promise<void> {
    const lines = this.mergeLines(context);

    for (const line of lines) {
      this.assertLineQuantity(line.quantity);

      const item = await this.requireStockItem(context, line.productId, manager, true);
      item.quantityOnHand = addQty(item.quantityOnHand, line.quantity);
      this.assertNonNegative(item);

      await this.stockItemRepository.save(item, manager);

      await this.recordMovement(
        {
          tenantId: context.tenantId,
          stockItemId: item.id,
          type: StockMovementType.REFUND,
          delta: line.quantity,
          source: StockMovementSource.ORDER,
          orderId: context.orderId,
        },
        manager,
      );

      this.runIntegrationHooks(item);
    }
  }

  private async requireStockItem(
    context: InventoryOrderContext,
    productId: string,
    manager: EntityManager,
    lock = false,
  ): Promise<StockItemEntity> {
    const item = await this.stockItemRepository.findByProductForTenant(
      context.tenantId,
      context.locationId,
      productId,
      manager,
      lock,
    );
    if (!item) {
      throwInventoryItemNotFound(productId, context.locationId);
    }
    return item;
  }

  private assertNonNegative(item: StockItemEntity): void {
    if (parseQty(item.quantityOnHand) < 0) {
      throwNegativeStock(item.sku, 'quantityOnHand');
    }
    if (parseQty(item.quantityReserved) < 0) {
      throwNegativeStock(item.sku, 'quantityReserved');
    }
    if (parseQty(item.quantityReserved) > parseQty(item.quantityOnHand)) {
      throwInsufficientStock(item.sku, parseQty(item.quantityOnHand), parseQty(item.quantityReserved));
    }
  }

  private assertLineQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException(`Invalid line quantity: ${quantity}`);
    }
  }

  private toStockView(item: StockItemEntity): InventoryStockView {
    const available = availableQty(item.quantityOnHand, item.quantityReserved);
    return {
      stockItemId: item.id,
      productId: item.productId!,
      sku: item.sku,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      available: formatQty(available),
    };
  }

  private runIntegrationHooks(item: StockItemEntity): void {
    this.lowStockAlertsService.checkAfterStockChange(item);
    this.autoReplenishmentService.evaluateAfterStockChange(item);
    this.supplierOrderingService.suggestPurchaseOrder(item);
  }
}
