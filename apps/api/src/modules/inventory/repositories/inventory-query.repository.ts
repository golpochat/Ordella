import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { LocationEntity } from '../../tenants/entities';
import { StockItemEntity } from '../entities/stock-item.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { computeStockHealth, stockLevelInt } from '../domain/stock-status.util';
import { availableQty, parseQty } from '../domain/stock-quantity.util';

export interface InventoryListRow {
  id: string;
  tenantId: string;
  locationId: string;
  itemId: string | null;
  name: string;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  stockLevel: number;
  reorderPoint: number | null;
  isActive: boolean;
  status: 'ok' | 'low' | 'out';
  quantityOnHand: string;
  quantityReserved: string;
  quantityAvailable: string;
  updatedAt: Date;
}

export interface MultiStoreInventoryRow extends InventoryListRow {
  locationName: string;
  locationType: string;
  syncSource: string;
  lastSyncedAt: Date | null;
  safetyStockLevel: number | null;
  incomingStock: string;
  inTransitStock: string;
  availableToSell: string;
  discrepancy: string | null;
}

@Injectable()
export class InventoryQueryRepository {
  constructor(
    @InjectRepository(StockItemEntity)
    private readonly stockRepository: Repository<StockItemEntity>,
    @InjectRepository(StockAdjustmentEntity)
    private readonly adjustmentRepository: Repository<StockAdjustmentEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async listInventory(
    tenantId: string,
    filter: { locationId?: string; search?: string; page?: number; limit?: number },
  ): Promise<InventoryListRow[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 200;

    const qb = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoin(ProductEntity, 'product', 'product.id = stock.product_id')
      .leftJoin(CategoryEntity, 'category', 'category.id = product.category_id')
      .where('stock.tenant_id = :tenantId', { tenantId })
      .orderBy('stock.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.locationId) {
      qb.andWhere('stock.location_id = :locationId', { locationId: filter.locationId });
    }

    if (filter.search?.trim()) {
      qb.andWhere(
        '(LOWER(stock.name) LIKE :search OR LOWER(stock.sku) LIKE :search)',
        { search: `%${filter.search.trim().toLowerCase()}%` },
      );
    }

    const rows = await qb
      .select([
        'stock.id AS id',
        'stock.tenant_id AS "tenantId"',
        'stock.location_id AS "locationId"',
        'stock.product_id AS "itemId"',
        'stock.name AS name',
        'stock.sku AS sku',
        'product.category_id AS "categoryId"',
        'category.name AS "categoryName"',
        'stock.quantity_on_hand AS "quantityOnHand"',
        'stock.quantity_reserved AS "quantityReserved"',
        'COALESCE(stock.reorder_point, stock.reorder_level) AS "reorderLevel"',
        'stock.is_active AS "isActive"',
        'stock.updated_at AS "updatedAt"',
      ])
      .getRawMany<{
        id: string;
        tenantId: string;
        locationId: string;
        itemId: string | null;
        name: string;
        sku: string;
        categoryId: string | null;
        categoryName: string | null;
        quantityOnHand: string;
        quantityReserved: string;
        reorderLevel: string | null;
        isActive: boolean;
        updatedAt: Date;
      }>();

    return rows.map((row) => {
      const status = computeStockHealth(
        row.quantityOnHand,
        row.quantityReserved,
        row.reorderLevel,
        row.isActive ?? true,
      );
      const available = availableQty(row.quantityOnHand, row.quantityReserved);
      return {
        id: row.id,
        tenantId: row.tenantId,
        locationId: row.locationId,
        itemId: row.itemId,
        name: row.name,
        sku: row.sku,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        stockLevel: stockLevelInt(row.quantityOnHand, row.quantityReserved),
        reorderPoint:
          row.reorderLevel !== null ? Math.floor(parseQty(row.reorderLevel)) : null,
        isActive: row.isActive ?? true,
        status,
        quantityOnHand: row.quantityOnHand,
        quantityReserved: row.quantityReserved,
        quantityAvailable: available.toFixed(4),
        updatedAt: row.updatedAt,
      };
    });
  }

  async listLowStock(
    tenantId: string,
    locationId?: string,
  ): Promise<InventoryListRow[]> {
    const all = await this.listInventory(tenantId, {
      locationId,
      limit: 500,
    });
    return all.filter((row) => row.status === 'low' || row.status === 'out');
  }

  async listMultiStoreInventory(
    tenantId: string,
    filter: { locationId?: string; search?: string; page?: number; limit?: number },
  ): Promise<MultiStoreInventoryRow[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 500;
    const qb = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoin(ProductEntity, 'product', 'product.id = stock.product_id')
      .leftJoin(CategoryEntity, 'category', 'category.id = product.category_id')
      .leftJoin(LocationEntity, 'location', 'location.id = stock.location_id')
      .where('stock.tenant_id = :tenantId', { tenantId })
      .orderBy('stock.name', 'ASC')
      .addOrderBy('location.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.locationId) qb.andWhere('stock.location_id = :locationId', { locationId: filter.locationId });
    if (filter.search?.trim()) {
      qb.andWhere('(LOWER(stock.name) LIKE :search OR LOWER(stock.sku) LIKE :search)', {
        search: `%${filter.search.trim().toLowerCase()}%`,
      });
    }

    const rows = await qb
      .select([
        'stock.id AS id',
        'stock.tenant_id AS "tenantId"',
        'stock.location_id AS "locationId"',
        'stock.product_id AS "itemId"',
        'stock.name AS name',
        'stock.sku AS sku',
        'product.category_id AS "categoryId"',
        'category.name AS "categoryName"',
        'location.name AS "locationName"',
        'location.location_type AS "locationType"',
        'stock.quantity_on_hand AS "quantityOnHand"',
        'stock.quantity_reserved AS "quantityReserved"',
        'COALESCE(stock.reorder_point, stock.reorder_level) AS "reorderLevel"',
        'stock.safety_stock_level AS "safetyStockLevel"',
        'stock.sync_source AS "syncSource"',
        'stock.last_synced_at AS "lastSyncedAt"',
        'stock.is_active AS "isActive"',
        'stock.updated_at AS "updatedAt"',
      ])
      .getRawMany<{
        id: string;
        tenantId: string;
        locationId: string;
        itemId: string | null;
        name: string;
        sku: string;
        categoryId: string | null;
        categoryName: string | null;
        locationName: string | null;
        locationType: string | null;
        quantityOnHand: string;
        quantityReserved: string;
        reorderLevel: string | null;
        safetyStockLevel: string | null;
        syncSource: string | null;
        lastSyncedAt: Date | null;
        isActive: boolean;
        updatedAt: Date;
      }>();

    return rows.map((row) => {
      const available = availableQty(row.quantityOnHand, row.quantityReserved);
      const status = computeStockHealth(row.quantityOnHand, row.quantityReserved, row.reorderLevel, row.isActive ?? true);
      const safety = row.safetyStockLevel !== null ? parseQty(row.safetyStockLevel) : null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        locationId: row.locationId,
        locationName: row.locationName ?? 'Location',
        locationType: row.locationType ?? 'store',
        itemId: row.itemId,
        name: row.name,
        sku: row.sku,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        stockLevel: stockLevelInt(row.quantityOnHand, row.quantityReserved),
        reorderPoint: row.reorderLevel !== null ? Math.floor(parseQty(row.reorderLevel)) : null,
        safetyStockLevel: safety !== null ? Math.floor(safety) : null,
        syncSource: row.syncSource ?? 'store',
        lastSyncedAt: row.lastSyncedAt,
        isActive: row.isActive ?? true,
        status,
        quantityOnHand: row.quantityOnHand,
        quantityReserved: row.quantityReserved,
        quantityAvailable: available.toFixed(4),
        incomingStock: '0.0000',
        inTransitStock: '0.0000',
        availableToSell: Math.max(0, available - (safety ?? 0)).toFixed(4),
        discrepancy: safety !== null && available < safety ? 'below_safety_stock' : null,
        updatedAt: row.updatedAt,
      };
    });
  }

  async countByStatus(tenantId: string, locationId?: string) {
    const rows = await this.listInventory(tenantId, { locationId, limit: 1000 });
    return {
      total: rows.length,
      low: rows.filter((r) => r.status === 'low').length,
      out: rows.filter((r) => r.status === 'out').length,
      ok: rows.filter((r) => r.status === 'ok').length,
    };
  }

  async listRecentAdjustments(tenantId: string, locationId?: string, limit = 50) {
    const qb = this.adjustmentRepository
      .createQueryBuilder('adj')
      .where('adj.tenant_id = :tenantId', { tenantId })
      .orderBy('adj.created_at', 'DESC')
      .take(limit);

    if (locationId) {
      qb.andWhere('adj.location_id = :locationId', { locationId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => ({
      id: row.id,
      stockItemId: row.stockItemId,
      locationId: row.locationId,
      change: parseQty(row.quantityDelta),
      reason: row.reason,
      type: row.type,
      staffId: row.adjustedBy,
      createdAt: row.createdAt,
    }));
  }

  async findAvailableStockByProductIds(
    tenantId: string,
    locationId: string,
    productIds: string[],
  ): Promise<Map<string, number>> {
    if (!productIds.length) {
      return new Map();
    }

    const rows = await this.stockRepository.find({
      where: {
        tenantId,
        locationId,
        productId: In(productIds),
        isActive: true,
      },
    });

    const map = new Map<string, number>();
    for (const row of rows) {
      if (!row.productId) {
        continue;
      }
      const available = availableQty(row.quantityOnHand, row.quantityReserved);
      map.set(row.productId, Math.max(0, Math.floor(available)));
    }
    return map;
  }

  async getMovementAnalytics(tenantId: string, locationId?: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const qb = this.orderItemRepository
      .createQueryBuilder('oi')
      .innerJoin(OrderEntity, 'o', 'o.id = oi.order_id')
      .innerJoin(ProductEntity, 'p', 'p.id = oi.product_id')
      .select('oi.product_id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('SUM(oi.quantity)', 'quantitySold')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= :since', { since })
      .andWhere('o.status NOT IN (:...excluded)', {
        excluded: [OrderStatus.CANCELLED, OrderStatus.FAILED],
      })
      .groupBy('oi.product_id')
      .addGroupBy('p.name')
      .orderBy('quantitySold', 'DESC');

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const sold = await qb.getRawMany<{
      productId: string;
      name: string;
      quantitySold: string;
    }>();

    const fastMoving = sold.slice(0, 10).map((row) => ({
      productId: row.productId,
      name: row.name,
      quantitySold: Number.parseInt(row.quantitySold, 10),
    }));

    const stockRows = await this.listInventory(tenantId, { locationId, limit: 500 });
    const soldIds = new Set(sold.map((s) => s.productId));
    const slowMoving = stockRows
      .filter((row) => row.itemId && row.stockLevel > 0 && !soldIds.has(row.itemId))
      .slice(0, 10)
      .map((row) => ({
        stockItemId: row.id,
        productId: row.itemId,
        name: row.name,
        stockLevel: row.stockLevel,
      }));

    return { fastMoving, slowMoving };
  }

  async ensureStockForTrackedProducts(
    tenantId: string,
    locationId: string,
  ): Promise<number> {
    const products = await this.productRepository.find({
      where: { tenantId, inventoryTrackingEnabled: true },
    });

    let created = 0;
    for (const product of products) {
      const existing = await this.stockRepository.findOne({
        where: { tenantId, locationId, productId: product.id },
      });
      if (existing) {
        continue;
      }

      const initial = product.stockLevel ?? 0;
      await this.stockRepository.save(
        this.stockRepository.create({
          tenantId,
          locationId,
          productId: product.id,
          name: product.name,
          sku: product.sku ?? product.id.slice(0, 8),
          unit: 'each',
          quantityOnHand: String(Math.max(0, initial)),
          quantityReserved: '0',
          reorderLevel: null,
          reorderPoint: null,
          safetyStockLevel: null,
          syncSource: 'store',
          lastSyncedAt: new Date(),
          isActive: true,
        }),
      );
      created += 1;
    }

    return created;
  }
}
