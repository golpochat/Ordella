import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../../common/interfaces';
import { TenantContext } from '../../../common/interfaces';
import { StockAdjustmentType } from '../enums/stock-adjustment-type.enum';
import { InventoryAdjustDto, InventoryAdjustReason } from '../dto/inventory/inventory-adjust.dto';
import { InventorySnapshotDto, InventorySyncDto } from '../dto/inventory/inventory-sync.dto';
import { InventoryListQueryDto } from '../dto/inventory/inventory-list-query.dto';
import { UpdateInventoryItemDto } from '../dto/inventory/update-inventory-item.dto';
import { InventoryBulkUpdateDto } from '../dto/inventory/inventory-bulk-update.dto';
import { InventorySnapshotEntity, InventorySyncLogEntity, StockItemEntity } from '../entities';
import { InventoryQueryRepository } from '../repositories/inventory-query.repository';
import { StockItemRepository } from '../repositories/stock-item.repository';
import { InventoryService } from './inventory.service';
import { formatQty } from '../domain/stock-quantity.util';

@Injectable()
export class InventoryManagementService {
  constructor(
    private readonly queryRepository: InventoryQueryRepository,
    private readonly stockItemRepository: StockItemRepository,
    private readonly inventoryService: InventoryService,
    @InjectRepository(InventorySyncLogEntity)
    private readonly syncLogs: Repository<InventorySyncLogEntity>,
    @InjectRepository(InventorySnapshotEntity)
    private readonly snapshots: Repository<InventorySnapshotEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
  ) {}

  async list(tenantId: string, query: InventoryListQueryDto) {
    if (query.locationId) {
      await this.queryRepository.ensureStockForTrackedProducts(tenantId, query.locationId);
    }
    return this.queryRepository.listInventory(tenantId, {
      locationId: query.locationId,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async listLowStock(tenantId: string, locationId?: string) {
    if (locationId) {
      await this.queryRepository.ensureStockForTrackedProducts(tenantId, locationId);
    }
    return this.queryRepository.listLowStock(tenantId, locationId);
  }

  async getSummary(tenantId: string, locationId?: string) {
    if (locationId) {
      await this.queryRepository.ensureStockForTrackedProducts(tenantId, locationId);
    }
    const counts = await this.queryRepository.countByStatus(tenantId, locationId);
    const [adjustments, movement] = await Promise.all([
      this.queryRepository.listRecentAdjustments(tenantId, locationId, 20),
      this.queryRepository.getMovementAnalytics(tenantId, locationId),
    ]);
    return {
      counts,
      recentAdjustments: adjustments,
      fastMovingItems: movement.fastMoving,
      slowMovingItems: movement.slowMoving,
    };
  }

  async listMultiStore(tenantId: string, query: InventoryListQueryDto) {
    return this.queryRepository.listMultiStoreInventory(tenantId, {
      locationId: query.locationId,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async sync(tenantId: string, dto: InventorySyncDto) {
    const now = new Date();
    const qb = this.stockItems
      .createQueryBuilder()
      .update(StockItemEntity)
      .set({ lastSyncedAt: now })
      .where('tenant_id = :tenantId', { tenantId });
    if (dto.itemId) qb.andWhere('product_id = :itemId', { itemId: dto.itemId });
    if (dto.fromLocationId || dto.toLocationId) {
      qb.andWhere('location_id IN (:...locationIds)', {
        locationIds: [dto.fromLocationId, dto.toLocationId].filter(Boolean),
      });
    }
    const result = await qb.execute();
    const log = await this.syncLogs.save(this.syncLogs.create({
      tenantId,
      itemId: dto.itemId ?? null,
      fromLocationId: dto.fromLocationId ?? null,
      toLocationId: dto.toLocationId ?? null,
      quantity: formatQty(dto.quantity ?? 0),
      reason: dto.reason ?? 'auto-sync',
    }));
    return {
      syncedAt: now,
      affected: result.affected ?? 0,
      log,
      rows: await this.queryRepository.listMultiStoreInventory(tenantId, {
        locationId: dto.toLocationId ?? dto.fromLocationId,
        limit: 500,
      }),
    };
  }

  async createSnapshot(tenantId: string, dto: InventorySnapshotDto) {
    const rows = await this.queryRepository.listMultiStoreInventory(tenantId, {
      locationId: dto.locationId,
      limit: 1000,
    });
    const snapshot = await this.snapshots.save(this.snapshots.create({
      tenantId,
      locationId: dto.locationId ?? null,
      snapshot: {
        label: dto.label ?? null,
        generatedAt: new Date().toISOString(),
        totals: {
          rows: rows.length,
          lowStock: rows.filter((row) => row.status === 'low').length,
          outOfStock: rows.filter((row) => row.status === 'out').length,
          discrepancies: rows.filter((row) => row.discrepancy).length,
        },
        rows,
      },
    }));
    return snapshot;
  }

  async listLogs(tenantId: string) {
    return this.syncLogs.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async updateItem(tenantId: string, dto: UpdateInventoryItemDto) {
    const item = await this.stockItemRepository.findByIdForTenant(tenantId, dto.id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (dto.stockLevel !== undefined) {
      const reserved = parseFloat(item.quantityReserved);
      item.quantityOnHand = formatQty(dto.stockLevel + reserved);
    }
    if (dto.reorderPoint !== undefined) {
      item.reorderLevel = formatQty(dto.reorderPoint);
      item.reorderPoint = formatQty(dto.reorderPoint);
    }
    if (dto.isActive !== undefined) {
      item.isActive = dto.isActive;
    }
    item.lastSyncedAt = new Date();

    const saved = await this.stockItemRepository.save(item);
    await this.syncLogs.save(this.syncLogs.create({
      tenantId,
      itemId: saved.productId,
      fromLocationId: null,
      toLocationId: saved.locationId,
      quantity: '0.0000',
      reason: 'adjustment',
    }));
    const rows = await this.queryRepository.listInventory(tenantId, {
      locationId: saved.locationId,
      limit: 500,
    });
    return rows.find((r) => r.id === saved.id) ?? null;
  }

  async bulkUpdate(tenantId: string, dto: InventoryBulkUpdateDto) {
    const results = [];
    for (const entry of dto.items) {
      const updated = await this.updateItem(tenantId, entry);
      if (updated) {
        results.push(updated);
      }
    }
    return results;
  }

  async adjust(
    tenantId: string,
    dto: InventoryAdjustDto,
    user?: AuthenticatedUser,
  ) {
    if (dto.change === 0) {
      throw new BadRequestException('Adjustment change cannot be zero');
    }

    const type = this.mapReasonToType(dto.reason);
    const reasonText = [dto.reason, dto.notes].filter(Boolean).join(' — ');

    const view = await this.inventoryService.adjustStock(tenantId, {
      stockItemId: dto.stockItemId,
      locationId: dto.locationId,
      type,
      delta: dto.change,
      reason: reasonText,
      userId: dto.staffId ?? user?.id,
    });

    return view;
  }

  private mapReasonToType(reason: InventoryAdjustReason): StockAdjustmentType {
    switch (reason) {
      case InventoryAdjustReason.WASTE:
        return StockAdjustmentType.DAMAGE;
      case InventoryAdjustReason.CORRECTION:
        return StockAdjustmentType.CORRECTION;
      default:
        return StockAdjustmentType.MANUAL;
    }
  }
}
