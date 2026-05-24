import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { OrderStatusHistoryEntity } from '../../orders/entities/order-status-history.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { StockItemEntity } from '../../inventory/entities/stock-item.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { DeliveryTaskEntity } from '../../deliveries/entities/delivery-task.entity';
import { DeliveryTaskStatus } from '../../deliveries/enums/delivery-task-status.enum';
import { AnalyticsRange } from '../domain/analytics-date-range';
import { groupChannelKey, labelSalesChannel } from '../domain/analytics-channel-labels';
import type {
  AnalyticsCategoryPointView,
  AnalyticsChannelPointView,
  AnalyticsDayPointView,
  AnalyticsLocationPointView,
  AnalyticsLowInventoryView,
  AnalyticsOverviewView,
  AnalyticsRecentOrderView,
  AnalyticsTopItemView,
} from '../types/analytics.views';

const EXCLUDED_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];

@Injectable()
export class AnalyticsQueryRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly statusHistoryRepository: Repository<OrderStatusHistoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockRepository: Repository<StockItemEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveryTaskRepository: Repository<DeliveryTaskEntity>,
  ) {}

  async getOverview(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsOverviewView> {
    const current = await this.aggregateSales(tenantId, range.fromDate, range.toDate, locationId);
    const previous = await this.aggregateSales(
      tenantId,
      range.previousFromDate,
      range.previousToDate,
      locationId,
    );

    let growthPercent: number | null = null;
    const prevRevenue = Number.parseFloat(previous.revenue);
    const curRevenue = Number.parseFloat(current.revenue);
    if (prevRevenue > 0) {
      growthPercent = Number((((curRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));
    } else if (curRevenue > 0) {
      growthPercent = 100;
    }

    const avgOrderValue =
      current.orders > 0
        ? (curRevenue / current.orders).toFixed(2)
        : '0.00';

    const fulfillmentTimeAvgMinutes = await this.avgFulfillmentMinutes(
      tenantId,
      range.fromDate,
      range.toDate,
      locationId,
    );

    const deliveryStats = await this.avgDeliveryMinutes(
      tenantId,
      range.fromDate,
      range.toDate,
      locationId,
    );

    return {
      salesTotal: current.revenue,
      ordersTotal: current.orders,
      avgOrderValue,
      growthPercent,
      fulfillmentTimeAvgMinutes,
      deliveryTimeAvgMinutes: deliveryStats.avgMinutes,
      deliveryEnabled: deliveryStats.hasDeliveries,
    };
  }

  async getRevenueByDay(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsDayPointView[]> {
    const rows = await this.dailyOrderAggregates(tenantId, range, locationId);
    return rows.map((r) => ({
      date: r.date,
      revenue: r.revenue,
      orders: r.orders,
    }));
  }

  async getOrdersByDay(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsDayPointView[]> {
    return this.getRevenueByDay(tenantId, range, locationId);
  }

  async getSalesByChannel(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsChannelPointView[]> {
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select('o.order_type', 'orderType')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', {
        from: range.fromDate,
        to: range.toDate,
      })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES })
      .groupBy('o.order_type');

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawMany<{ orderType: string; orders: string; revenue: string }>();
    const grouped = new Map<string, { revenue: number; orders: number }>();

    for (const row of raw) {
      const key = groupChannelKey(row.orderType);
      const existing = grouped.get(key) ?? { revenue: 0, orders: 0 };
      existing.revenue += Number.parseFloat(row.revenue);
      existing.orders += Number.parseInt(row.orders, 10);
      grouped.set(key, existing);
    }

    const labels: Record<string, string> = {
      pos: 'POS (in-store)',
      online: 'Online storefront',
      delivery: 'Delivery',
      pickup: 'Pickup',
    };

    return [...grouped.entries()].map(([channel, stats]) => ({
      channel,
      label: labels[channel] ?? labelSalesChannel(channel),
      revenue: stats.revenue.toFixed(2),
      orders: stats.orders,
    }));
  }

  async getSalesByLocation(
    tenantId: string,
    range: AnalyticsRange,
  ): Promise<AnalyticsLocationPointView[]> {
    const raw = await this.orderRepository
      .createQueryBuilder('o')
      .leftJoin(LocationEntity, 'loc', 'loc.id = o.location_id')
      .select('o.location_id', 'locationId')
      .addSelect("COALESCE(loc.name, 'Unknown location')", 'locationName')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', {
        from: range.fromDate,
        to: range.toDate,
      })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES })
      .groupBy('o.location_id')
      .addGroupBy('loc.name')
      .orderBy('revenue', 'DESC')
      .getRawMany<{
        locationId: string;
        locationName: string;
        orders: string;
        revenue: string;
      }>();

    return raw.map((row) => ({
      locationId: row.locationId,
      locationName: row.locationName,
      revenue: Number.parseFloat(row.revenue).toFixed(2),
      orders: Number.parseInt(row.orders, 10),
    }));
  }

  async getTopItems(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
    limit = 10,
  ): Promise<AnalyticsTopItemView[]> {
    const qb = this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .leftJoin(ProductEntity, 'p', 'p.id = item.product_id')
      .select('item.product_id', 'productId')
      .addSelect("COALESCE(p.name, 'Item')", 'productName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(item.quantity * item.price), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', {
        from: range.fromDate,
        to: range.toDate,
      })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES })
      .groupBy('item.product_id')
      .addGroupBy('p.name')
      .orderBy('quantitySold', 'DESC')
      .limit(limit);

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawMany<{
      productId: string;
      productName: string;
      quantitySold: string;
      revenue: string;
    }>();

    return raw.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      quantitySold: Number.parseInt(row.quantitySold, 10),
      revenue: Number.parseFloat(row.revenue).toFixed(2),
    }));
  }

  async getCategoryPerformance(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsCategoryPointView[]> {
    const qb = this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .leftJoin(ProductEntity, 'p', 'p.id = item.product_id')
      .leftJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .select('p.category_id', 'categoryId')
      .addSelect("COALESCE(c.name, 'Uncategorized')", 'categoryName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(item.quantity * item.price), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', {
        from: range.fromDate,
        to: range.toDate,
      })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES })
      .groupBy('p.category_id')
      .addGroupBy('c.name')
      .orderBy('revenue', 'DESC');

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawMany<{
      categoryId: string | null;
      categoryName: string;
      quantitySold: string;
      revenue: string;
    }>();

    return raw.map((row) => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      quantitySold: Number.parseInt(row.quantitySold, 10),
      revenue: Number.parseFloat(row.revenue).toFixed(2),
    }));
  }

  async getLowInventory(
    tenantId: string,
    locationId?: string,
    limit = 20,
  ): Promise<AnalyticsLowInventoryView[]> {
    const qb = this.stockRepository
      .createQueryBuilder('s')
      .where('s.tenant_id = :tenantId', { tenantId })
      .andWhere(
        `(s.quantity_on_hand <= 0 OR s.quantity_on_hand <= COALESCE(s.reorder_level, :defaultReorder, 0))`,
        { defaultReorder: '5' },
      )
      .orderBy('s.quantity_on_hand', 'ASC')
      .limit(limit);

    if (locationId) {
      qb.andWhere('s.location_id = :locationId', { locationId });
    }

    const rows = await qb.getMany();
    return rows.map((row) => {
      const onHand = Number.parseFloat(row.quantityOnHand);
      return {
        id: row.id,
        locationId: row.locationId,
        name: row.name,
        sku: row.sku,
        quantityOnHand: row.quantityOnHand,
        reorderLevel: row.reorderLevel,
        status: onHand <= 0 ? 'out_of_stock' : 'low',
      };
    });
  }

  async getRecentOrders(
    tenantId: string,
    locationId?: string,
    limit = 10,
  ): Promise<AnalyticsRecentOrderView[]> {
    const rows = await this.orderRepository.find({
      where: {
        tenantId,
        ...(locationId ? { locationId } : {}),
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      channelLabel: labelSalesChannel(order.orderType),
      status: order.status,
      total: order.total,
      locationId: order.locationId,
      createdAt: order.createdAt.toISOString(),
    }));
  }

  async listLocations(tenantId: string): Promise<{ id: string; name: string }[]> {
    const rows = await this.locationRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });
    return rows.map((l) => ({ id: l.id, name: l.name }));
  }

  private async aggregateSales(
    tenantId: string,
    from: Date,
    to: Date,
    locationId?: string,
  ): Promise<{ revenue: string; orders: number }> {
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from, to })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES });

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawOne<{ orders: string; revenue: string }>();
    return {
      orders: Number.parseInt(raw?.orders ?? '0', 10),
      revenue: Number.parseFloat(raw?.revenue ?? '0').toFixed(2),
    };
  }

  private async dailyOrderAggregates(
    tenantId: string,
    range: AnalyticsRange,
    locationId?: string,
  ): Promise<AnalyticsDayPointView[]> {
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', {
        from: range.fromDate,
        to: range.toDate,
      })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_STATUSES })
      .groupBy("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')")
      .orderBy('date', 'ASC');

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawMany<{ date: string; orders: string; revenue: string }>();
    return raw.map((row) => ({
      date: row.date,
      orders: Number.parseInt(row.orders, 10),
      revenue: Number.parseFloat(row.revenue).toFixed(2),
    }));
  }

  private async avgFulfillmentMinutes(
    tenantId: string,
    from: Date,
    to: Date,
    locationId?: string,
  ): Promise<number | null> {
    const params: unknown[] = [tenantId, from, to];
    let locationClause = '';
    if (locationId) {
      locationClause = 'AND o.location_id = $4';
      params.push(locationId);
    }

    const rows = await this.orderRepository.manager.query(
      `
      SELECT AVG(EXTRACT(EPOCH FROM (t.ready_at - t.prep_at)) / 60) AS avg_minutes
      FROM (
        SELECT h.order_id,
          MIN(CASE WHEN h.to_status = 'preparing' THEN h.created_at END) AS prep_at,
          MIN(CASE WHEN h.to_status = 'ready' THEN h.created_at END) AS ready_at
        FROM order_status_history h
        INNER JOIN orders o ON o.id = h.order_id
        WHERE o.tenant_id = $1
          AND o.created_at BETWEEN $2 AND $3
          ${locationClause}
          AND h.to_status IN ('preparing', 'ready')
        GROUP BY h.order_id
      ) t
      WHERE t.prep_at IS NOT NULL AND t.ready_at IS NOT NULL
      `,
      params,
    );

    const value = rows[0]?.avg_minutes;
    if (value === null || value === undefined) {
      return null;
    }
    const minutes = Number.parseFloat(String(value));
    return Number.isNaN(minutes) ? null : Number(minutes.toFixed(1));
  }

  private async avgDeliveryMinutes(
    tenantId: string,
    from: Date,
    to: Date,
    locationId?: string,
  ): Promise<{ avgMinutes: number | null; hasDeliveries: boolean }> {
    const qb = this.deliveryTaskRepository
      .createQueryBuilder('t')
      .innerJoin(OrderEntity, 'o', 'o.id = t.order_id')
      .select(
        'AVG(EXTRACT(EPOCH FROM (t.completed_at - t.started_at)) / 60)',
        'avgMinutes',
      )
      .addSelect('COUNT(*)', 'count')
      .where('t.tenant_id = :tenantId', { tenantId })
      .andWhere('t.status = :delivered', { delivered: DeliveryTaskStatus.DELIVERED })
      .andWhere('t.started_at IS NOT NULL')
      .andWhere('t.completed_at IS NOT NULL')
      .andWhere('t.completed_at BETWEEN :from AND :to', { from, to });

    if (locationId) {
      qb.andWhere('o.location_id = :locationId', { locationId });
    }

    const raw = await qb.getRawOne<{ avgMinutes: string | null; count: string }>();
    const count = Number.parseInt(raw?.count ?? '0', 10);
    const minutes = raw?.avgMinutes ? Number.parseFloat(raw.avgMinutes) : null;

    return {
      hasDeliveries: count > 0,
      avgMinutes: minutes !== null && !Number.isNaN(minutes) ? Number(minutes.toFixed(1)) : null,
    };
  }
}
