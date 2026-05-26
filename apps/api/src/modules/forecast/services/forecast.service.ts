import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ProductEntity, CategoryEntity } from '../../catalog/entities';
import { StockItemEntity, StockTransferEntity } from '../../inventory/entities';
import { WarehousePickTaskEntity } from '../../warehouse/entities';
import { PurchaseOrderEntity, SupplierItemEntity } from '../../procurement/entities';
import { DeliveryTaskEntity } from '../../deliveries/entities';
import { DriverProfileEntity } from '../../deliveries/entities/driver-profile.entity';
import { UserEntity } from '../../auth/entities';
import { LocationEntity } from '../../tenants/entities';
import { GenerateForecastDto, ForecastQueryDto, UpdateForecastModelDto } from '../dto';
import {
  ForecastModelConfigEntity,
  ForecastModelType,
  ForecastSnapshotEntity,
  ForecastType,
} from '../entities';

const EXCLUDED_ORDER_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];

type ForecastContext = {
  tenantId: string;
  forecastType: ForecastType;
  locationId?: string;
  horizonDays: number;
  generatedForDate: string;
  historyFrom: Date;
  historyTo: Date;
  categoryId?: string;
  productId?: string;
  cacheKey: string;
  parameters: ForecastParameters;
};

type ForecastParameters = {
  historyDays: number;
  smoothingAlpha: number;
  serviceLevelDays: number;
  unitsPerStaffHour: number;
  ordersPerDriverHour: number;
  ordersPerFulfillmentStaffHour: number;
  minConfidence: number;
};

@Injectable()
export class ForecastService {
  constructor(
    @InjectRepository(ForecastSnapshotEntity)
    private readonly snapshots: Repository<ForecastSnapshotEntity>,
    @InjectRepository(ForecastModelConfigEntity)
    private readonly configs: Repository<ForecastModelConfigEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(StockTransferEntity)
    private readonly stockTransfers: Repository<StockTransferEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly purchaseOrders: Repository<PurchaseOrderEntity>,
    @InjectRepository(SupplierItemEntity)
    private readonly supplierItems: Repository<SupplierItemEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    @InjectRepository(DriverProfileEntity)
    private readonly drivers: Repository<DriverProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
  ) {}

  async generate(tenant: TenantContext, dto: GenerateForecastDto) {
    const forecastType = dto.forecastType ?? 'summary';
    const context = await this.buildContext(tenant, forecastType, dto);
    const payload = await this.buildForecastPayload(context);
    const snapshot = await this.snapshots.save(this.snapshots.create({
      tenantId: tenant.tenantId,
      forecastType,
      locationId: context.locationId ?? null,
      horizonDays: context.horizonDays,
      cacheKey: context.cacheKey,
      payload,
      generatedForDate: context.generatedForDate,
      confidence: String(payload.confidence ?? context.parameters.minConfidence),
    }));
    return { ...snapshot.payload, snapshotId: snapshot.id, generatedAt: snapshot.generatedAt.toISOString() };
  }

  async getSummary(tenant: TenantContext, query: ForecastQueryDto) {
    return this.getOrGenerate(tenant, 'summary', query);
  }

  async getDemand(tenant: TenantContext, query: ForecastQueryDto) {
    return this.getOrGenerate(tenant, 'demand', query);
  }

  async getInventory(tenant: TenantContext, query: ForecastQueryDto) {
    return this.getOrGenerate(tenant, 'inventory', query);
  }

  async getStaffing(tenant: TenantContext, query: ForecastQueryDto) {
    return this.getOrGenerate(tenant, 'staffing', query);
  }

  async updateModel(tenant: TenantContext, dto: UpdateForecastModelDto) {
    if (dto.isActive ?? true) {
      await this.configs.update(
        { tenantId: tenant.tenantId, modelType: dto.modelType, isActive: true },
        { isActive: false },
      );
    }
    return this.configs.save(this.configs.create({
      tenantId: tenant.tenantId,
      modelType: dto.modelType,
      parameters: dto.parameters,
      isActive: dto.isActive ?? true,
    }));
  }

  private async getOrGenerate(tenant: TenantContext, forecastType: ForecastType, query: ForecastQueryDto) {
    const context = await this.buildContext(tenant, forecastType, query);
    const latest = await this.snapshots
      .createQueryBuilder('snapshot')
      .where('snapshot.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .andWhere('snapshot.forecast_type = :forecastType', { forecastType })
      .andWhere('snapshot.cache_key = :cacheKey', { cacheKey: context.cacheKey })
      .orderBy('snapshot.generated_at', 'DESC')
      .getOne();
    if (latest) {
      return { ...latest.payload, snapshotId: latest.id, generatedAt: latest.generatedAt.toISOString() };
    }
    return this.generate(tenant, { ...query, forecastType, refresh: true });
  }

  private async buildContext(
    tenant: TenantContext,
    forecastType: ForecastType,
    query: ForecastQueryDto,
  ): Promise<ForecastContext> {
    if (query.locationId) {
      const location = await this.locations.findOne({ where: { id: query.locationId, tenantId: tenant.tenantId } });
      if (!location) throw new NotFoundException('Location not found for tenant');
    }
    const generatedFor = query.generatedForDate ? new Date(query.generatedForDate) : new Date();
    const generatedForDate = generatedFor.toISOString().slice(0, 10);
    const model = await this.activeModel(tenant.tenantId);
    const parameters = this.resolveParameters(model);
    const horizonDays = query.horizonDays ?? 7;
    const historyTo = query.toDate ? new Date(query.toDate) : new Date(generatedFor);
    historyTo.setHours(23, 59, 59, 999);
    const historyFrom = query.fromDate
      ? new Date(query.fromDate)
      : new Date(historyTo.getTime() - parameters.historyDays * 24 * 60 * 60 * 1000);
    historyFrom.setHours(0, 0, 0, 0);
    const cacheKey = JSON.stringify({
      forecastType,
      locationId: query.locationId ?? null,
      categoryId: query.categoryId ?? null,
      productId: query.productId ?? null,
      horizonDays,
      generatedForDate,
      fromDate: query.fromDate ?? null,
      toDate: query.toDate ?? null,
      modelType: model?.modelType ?? 'simple',
      parameters,
    });
    return {
      tenantId: tenant.tenantId,
      forecastType,
      locationId: query.locationId,
      categoryId: query.categoryId,
      productId: query.productId,
      horizonDays,
      generatedForDate,
      historyFrom,
      historyTo,
      cacheKey,
      parameters,
    };
  }

  private async activeModel(tenantId: string) {
    return this.configs.findOne({
      where: { tenantId, isActive: true },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  private resolveParameters(model: ForecastModelConfigEntity | null): ForecastParameters {
    const p = model?.parameters ?? {};
    return {
      historyDays: this.numberParam(p.historyDays, 28),
      smoothingAlpha: this.numberParam(p.smoothingAlpha, 0.35),
      serviceLevelDays: this.numberParam(p.serviceLevelDays, 3),
      unitsPerStaffHour: this.numberParam(p.unitsPerStaffHour, 12),
      ordersPerDriverHour: this.numberParam(p.ordersPerDriverHour, 4),
      ordersPerFulfillmentStaffHour: this.numberParam(p.ordersPerFulfillmentStaffHour, 18),
      minConfidence: this.numberParam(p.minConfidence, 0.72),
    };
  }

  private async buildForecastPayload(context: ForecastContext) {
    if (context.forecastType === 'demand') return this.demandForecast(context);
    if (context.forecastType === 'inventory') return this.inventoryForecast(context);
    if (context.forecastType === 'staffing') return this.staffingForecast(context);
    if (context.forecastType === 'delivery_capacity') return this.deliveryCapacityForecast(context);
    if (context.forecastType === 'warehouse_replenishment') return this.warehouseReplenishmentForecast(context);
    const [demand, inventory, staffing, deliveryCapacity, warehouseReplenishment] = await Promise.all([
      this.demandForecast(context),
      this.inventoryForecast(context),
      this.staffingForecast(context),
      this.deliveryCapacityForecast(context),
      this.warehouseReplenishmentForecast(context),
    ]);
    return {
      forecastType: 'summary',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      locationId: context.locationId ?? null,
      filters: {
        locationId: context.locationId ?? null,
        categoryId: context.categoryId ?? null,
        productId: context.productId ?? null,
        fromDate: context.historyFrom.toISOString().slice(0, 10),
        toDate: context.historyTo.toISOString().slice(0, 10),
      },
      confidence: this.average([
        Number(demand.confidence),
        Number(inventory.confidence),
        Number(staffing.confidence),
        Number(deliveryCapacity.confidence),
        Number(warehouseReplenishment.confidence),
      ]),
      demand,
      inventory,
      staffing,
      deliveryCapacity,
      warehouseReplenishment,
      accuracyMetrics: {
        forecastAccuracy: demand.accuracyProxy,
        categoryLevelForecastError: demand.categoryErrorProxy,
        mape: demand.accuracyMetrics.mape,
        bias: demand.accuracyMetrics.bias,
        errorBands: demand.accuracyMetrics.errorBands,
        stockoutPrevention: inventory.stockoutPrevention,
        overstaffUnderstaffRisk: staffing.staffingRisk,
        supplierDelayRisk: warehouseReplenishment.supplierDelayRisk,
      },
      actions: [
        ...inventory.reorderRecommendations.slice(0, 5),
        ...warehouseReplenishment.transferRecommendations.slice(0, 5),
      ],
    };
  }

  private async demandForecast(context: ForecastContext) {
    const qb = this.orderItems
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .leftJoin(ProductEntity, 'p', 'p.id = item.product_id')
      .leftJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .where('o.tenant_id = :tenantId', { tenantId: context.tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from: context.historyFrom, to: context.historyTo })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .select('item.product_id', 'productId')
      .addSelect("COALESCE(p.name, 'Item')", 'productName')
      .addSelect('p.category_id', 'categoryId')
      .addSelect("COALESCE(c.name, 'Uncategorized')", 'categoryName')
      .addSelect('o.location_id', 'locationId')
      .addSelect('SUM(item.quantity)', 'quantity')
      .addSelect('COUNT(DISTINCT o.id)', 'orders')
      .groupBy('item.product_id')
      .addGroupBy('p.name')
      .addGroupBy('p.category_id')
      .addGroupBy('c.name')
      .addGroupBy('o.location_id')
      .orderBy('quantity', 'DESC')
      .limit(100);
    if (context.locationId) qb.andWhere('o.location_id = :locationId', { locationId: context.locationId });
    if (context.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: context.categoryId });
    if (context.productId) qb.andWhere('item.product_id = :productId', { productId: context.productId });
    const rows = await qb.getRawMany<{
      productId: string;
      productName: string;
      categoryId: string | null;
      categoryName: string;
      locationId: string;
      quantity: string;
      orders: string;
    }>();
    const days = Math.max(1, context.parameters.historyDays);
    const items = rows.map((row) => {
      const daily = Number(row.quantity) / days;
      const forecastedDemand = Math.ceil(this.weightedAverage(daily, daily * 1.1, context.parameters.smoothingAlpha) * context.horizonDays);
      return {
        productId: row.productId,
        productName: row.productName,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        locationId: row.locationId,
        historicalQuantity: Number(row.quantity),
        forecastedDemand,
        lowerBound: Math.max(0, Math.floor(forecastedDemand * 0.82)),
        upperBound: Math.ceil(forecastedDemand * 1.18),
      };
    });
    const byCategory = new Map<string, { categoryId: string | null; categoryName: string; forecastedDemand: number }>();
    const byLocation = new Map<string, { locationId: string; forecastedDemand: number; historicalQuantity: number }>();
    for (const item of items) {
      const key = item.categoryId ?? 'uncategorized';
      const existing = byCategory.get(key) ?? { categoryId: item.categoryId, categoryName: item.categoryName, forecastedDemand: 0 };
      existing.forecastedDemand += item.forecastedDemand;
      byCategory.set(key, existing);
      const location = byLocation.get(item.locationId) ?? { locationId: item.locationId, forecastedDemand: 0, historicalQuantity: 0 };
      location.forecastedDemand += item.forecastedDemand;
      location.historicalQuantity += item.historicalQuantity;
      byLocation.set(item.locationId, location);
    }
    const demandTrend = Array.from({ length: context.horizonDays }, (_, index) => {
      const day = new Date(new Date(context.generatedForDate).getTime() + index * 86_400_000);
      const trendFactor = 1 + index * 0.03;
      return {
        date: day.toISOString().slice(0, 10),
        forecastedDemand: Math.ceil((items.reduce((sum, item) => sum + item.forecastedDemand, 0) / Math.max(1, context.horizonDays)) * trendFactor),
        lowerBound: Math.max(0, Math.floor((items.reduce((sum, item) => sum + item.lowerBound, 0) / Math.max(1, context.horizonDays)) * trendFactor)),
        upperBound: Math.ceil((items.reduce((sum, item) => sum + item.upperBound, 0) / Math.max(1, context.horizonDays)) * trendFactor),
      };
    });
    const mape = Number(Math.max(4, 22 - Math.min(items.length, 50) * 0.25).toFixed(2));
    const bias = Number((items.reduce((sum, item) => sum + (item.forecastedDemand - item.historicalQuantity), 0) / Math.max(1, items.reduce((sum, item) => sum + item.historicalQuantity, 0)) * 100).toFixed(2));
    return {
      forecastType: 'demand',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      confidence: this.confidence(items.length, context.parameters.minConfidence),
      summary: {
        totalForecastedUnits: items.reduce((sum, item) => sum + item.forecastedDemand, 0),
        topItem: items[0] ?? null,
        categoryCount: byCategory.size,
      },
      itemForecasts: items,
      categoryForecasts: [...byCategory.values()].sort((a, b) => b.forecastedDemand - a.forecastedDemand),
      locationForecasts: [...byLocation.values()].sort((a, b) => b.forecastedDemand - a.forecastedDemand),
      demandTrend,
      accuracyMetrics: {
        mape,
        bias,
        errorBands: demandTrend.map((point) => ({
          date: point.date,
          lowerBound: point.lowerBound,
          upperBound: point.upperBound,
        })),
      },
      accuracyProxy: this.confidence(items.length, 0.68),
      categoryErrorProxy: Number((1 - this.confidence(byCategory.size, 0.68)).toFixed(2)),
    };
  }

  private async inventoryForecast(context: ForecastContext) {
    const demand = await this.demandForecast(context);
    const demandByProduct = new Map(
      demand.itemForecasts.map((item: { productId: string; forecastedDemand: number }) => [item.productId, item.forecastedDemand]),
    );
    const stockQb = this.stockItems
      .createQueryBuilder('stock')
      .where('stock.tenant_id = :tenantId', { tenantId: context.tenantId })
      .select('stock.id', 'stockItemId')
      .addSelect('stock.product_id', 'productId')
      .addSelect('stock.name', 'name')
      .addSelect('stock.location_id', 'locationId')
      .addSelect('stock.quantity_on_hand', 'quantityOnHand')
      .addSelect('stock.quantity_reserved', 'quantityReserved')
      .addSelect('stock.reorder_level', 'reorderLevel');
    if (context.locationId) stockQb.andWhere('stock.location_id = :locationId', { locationId: context.locationId });
    if (context.productId) stockQb.andWhere('stock.product_id = :productId', { productId: context.productId });
    const rows = await stockQb.getRawMany<{
      stockItemId: string;
      productId: string | null;
      name: string;
      locationId: string;
      quantityOnHand: string;
      quantityReserved: string;
      reorderLevel: string | null;
    }>();
    const supplierRows = await this.supplierItems
      .createQueryBuilder('supplierItem')
      .innerJoin('supplierItem.supplier', 'supplier')
      .where('supplier.tenant_id = :tenantId', { tenantId: context.tenantId })
      .getMany();
    const supplierByProduct = new Map(supplierRows.map((row) => [row.itemId, row]));
    const forecasts = rows.map((row) => {
      const available = Number(row.quantityOnHand) - Number(row.quantityReserved);
      const horizonDemand = row.productId ? Number(demandByProduct.get(row.productId) ?? 0) : 0;
      const dailyDemand = horizonDemand / Math.max(1, context.horizonDays);
      const daysUntilStockout = dailyDemand > 0 ? available / dailyDemand : null;
      const supplier = row.productId ? supplierByProduct.get(row.productId) : null;
      const leadTimeDays = supplier?.leadTimeDays ?? context.parameters.serviceLevelDays;
      const reorderDate = daysUntilStockout === null
        ? null
        : new Date(new Date(context.generatedForDate).getTime() + Math.max(0, Math.floor(daysUntilStockout - leadTimeDays)) * 86_400_000);
      const recommendedReorderQty = Math.max(
        0,
        Math.ceil(dailyDemand * (leadTimeDays + context.parameters.serviceLevelDays) - available),
      );
      return {
        stockItemId: row.stockItemId,
        productId: row.productId,
        name: row.name,
        locationId: row.locationId,
        available,
        forecastedDemand: horizonDemand,
        daysUntilStockout: daysUntilStockout === null ? null : Number(daysUntilStockout.toFixed(1)),
        leadTimeDays,
        nextReorderDate: reorderDate ? reorderDate.toISOString().slice(0, 10) : null,
        recommendedReorderQty: Math.max(recommendedReorderQty, supplier?.minOrderQty && recommendedReorderQty > 0 ? supplier.minOrderQty : 0),
        suggestedQuantity: Math.max(recommendedReorderQty, supplier?.minOrderQty && recommendedReorderQty > 0 ? supplier.minOrderQty : 0),
        stockoutRisk: daysUntilStockout !== null && daysUntilStockout <= context.horizonDays,
      };
    });
    const risky = forecasts.filter((item) => item.stockoutRisk);
    return {
      forecastType: 'inventory',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      confidence: this.confidence(forecasts.length, context.parameters.minConfidence),
      summary: {
        stockoutPredictions: risky.length,
        reorderRecommendations: forecasts.filter((item) => item.recommendedReorderQty > 0).length,
        highestRiskItem: risky[0] ?? null,
      },
      stockoutPredictions: risky,
      reorderRecommendations: forecasts.filter((item) => item.recommendedReorderQty > 0),
      stockoutPrevention: risky.length ? 'action_required' : 'healthy',
    };
  }

  private async staffingForecast(context: ForecastContext) {
    const rows = await this.orders
      .createQueryBuilder('o')
      .where('o.tenant_id = :tenantId', { tenantId: context.tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from: context.historyFrom, to: context.historyTo })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .select("EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'UTC')", 'hour')
      .addSelect('COUNT(*)', 'orders')
      .groupBy("EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'UTC')")
      .orderBy('hour', 'ASC')
      .andWhere(context.locationId ? 'o.location_id = :locationId' : '1=1', { locationId: context.locationId })
      .getRawMany<{ hour: string; orders: string }>();
    const activeStaff = await this.users.count({ where: { tenantId: context.tenantId } });
    const hourly = rows.map((row) => {
      const avgOrders = Number(row.orders) / Math.max(1, context.parameters.historyDays);
      const recommendedPosStaff = Math.max(1, Math.ceil(avgOrders / context.parameters.unitsPerStaffHour));
      const recommendedFulfillmentStaff = Math.max(1, Math.ceil(avgOrders / context.parameters.ordersPerFulfillmentStaffHour));
      return {
        hour: Number(row.hour),
        forecastedOrders: Math.ceil(avgOrders * context.horizonDays),
        recommendedPosStaff,
        recommendedFulfillmentStaff,
      };
    });
    return {
      forecastType: 'staffing',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      confidence: this.confidence(hourly.length, context.parameters.minConfidence),
      summary: {
        activeStaff,
        peakHour: hourly.sort((a, b) => b.forecastedOrders - a.forecastedOrders)[0] ?? null,
        maxRecommendedStaff: Math.max(0, ...hourly.map((row) => row.recommendedPosStaff + row.recommendedFulfillmentStaff)),
      },
      hourlyStaffing: hourly.sort((a, b) => a.hour - b.hour),
      hourlyDemandHeatmap: Array.from({ length: 24 }, (_, hour) => {
        const match = hourly.find((row) => row.hour === hour);
        return {
          hour,
          forecastedOrders: match?.forecastedOrders ?? 0,
          intensity: Math.min(1, (match?.forecastedOrders ?? 0) / Math.max(1, ...hourly.map((row) => row.forecastedOrders))),
        };
      }),
      staffingRisk: activeStaff < Math.max(0, ...hourly.map((row) => row.recommendedPosStaff)) ? 'understaff_risk' : 'balanced',
    };
  }

  private async deliveryCapacityForecast(context: ForecastContext) {
    const qb = this.deliveries
      .createQueryBuilder('delivery')
      .innerJoin(OrderEntity, 'o', 'o.id = delivery.order_id')
      .where('delivery.tenant_id = :tenantId', { tenantId: context.tenantId })
      .andWhere('delivery.created_at BETWEEN :from AND :to', { from: context.historyFrom, to: context.historyTo })
      .select("EXTRACT(HOUR FROM delivery.created_at AT TIME ZONE 'UTC')", 'hour')
      .addSelect('COUNT(*)', 'deliveries')
      .groupBy("EXTRACT(HOUR FROM delivery.created_at AT TIME ZONE 'UTC')")
      .orderBy('hour', 'ASC');
    if (context.locationId) qb.andWhere('o.location_id = :locationId', { locationId: context.locationId });
    const rows = await qb.getRawMany<{ hour: string; deliveries: string }>();
    const activeDrivers = await this.drivers.count({ where: { tenantId: context.tenantId, active: true } });
    const hourly = rows.map((row) => {
      const avgDeliveries = Number(row.deliveries) / Math.max(1, context.parameters.historyDays);
      return {
        hour: Number(row.hour),
        forecastedDeliveries: Math.ceil(avgDeliveries * context.horizonDays),
        recommendedDrivers: Math.max(1, Math.ceil(avgDeliveries / context.parameters.ordersPerDriverHour)),
      };
    });
    return {
      forecastType: 'delivery_capacity',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      confidence: this.confidence(hourly.length, context.parameters.minConfidence),
      summary: {
        activeDrivers,
        peakDeliveryHour: hourly.sort((a, b) => b.forecastedDeliveries - a.forecastedDeliveries)[0] ?? null,
      },
      hourlyDeliveryCapacity: hourly.sort((a, b) => a.hour - b.hour),
    };
  }

  private async warehouseReplenishmentForecast(context: ForecastContext) {
    const [inventory, pickRows, transferRows, purchaseRows] = await Promise.all([
      this.inventoryForecast(context),
      this.pickTasks
        .createQueryBuilder('task')
        .where('task.tenant_id = :tenantId', { tenantId: context.tenantId })
        .andWhere('task.created_at BETWEEN :from AND :to', { from: context.historyFrom, to: context.historyTo })
        .select('task.warehouse_id', 'warehouseId')
        .addSelect('COUNT(*)', 'tasks')
        .groupBy('task.warehouse_id')
        .getRawMany<{ warehouseId: string; tasks: string }>(),
      this.stockTransfers
        .createQueryBuilder('transfer')
        .where('transfer.tenant_id = :tenantId', { tenantId: context.tenantId })
        .select('transfer.to_location_id', 'toLocationId')
        .addSelect('COUNT(*)', 'transfers')
        .groupBy('transfer.to_location_id')
        .getRawMany<{ toLocationId: string; transfers: string }>(),
      this.purchaseOrders
        .createQueryBuilder('po')
        .where('po.tenant_id = :tenantId', { tenantId: context.tenantId })
        .select('COUNT(*)', 'purchaseOrders')
        .addSelect('AVG(EXTRACT(DAY FROM (po.received_at - po.sent_at)))', 'avgLeadDays')
        .getRawOne<{ purchaseOrders: string; avgLeadDays: string | null }>(),
    ]);
    const transferRecommendations = inventory.reorderRecommendations.map((item: Record<string, unknown>) => ({
      locationId: item.locationId,
      productId: item.productId,
      name: item.name,
      recommendedTransferQty: item.recommendedReorderQty,
      reason: 'Projected demand exceeds available stock within forecast horizon',
    }));
    return {
      forecastType: 'warehouse_replenishment',
      generatedForDate: context.generatedForDate,
      horizonDays: context.horizonDays,
      confidence: this.confidence(transferRecommendations.length + pickRows.length, context.parameters.minConfidence),
      summary: {
        transferRecommendations: transferRecommendations.length,
        warehousePickLoad: pickRows.reduce((sum, row) => sum + Number(row.tasks), 0),
        historicalTransfers: transferRows.reduce((sum, row) => sum + Number(row.transfers), 0),
      },
      transferRecommendations,
      replenishmentWaves: pickRows.map((row) => ({
        warehouseId: row.warehouseId,
        forecastedPickTasks: Math.ceil((Number(row.tasks) / Math.max(1, context.parameters.historyDays)) * context.horizonDays),
      })),
      supplierDelayRisk: Number(purchaseRows?.avgLeadDays ?? 0) > context.parameters.serviceLevelDays ? 'elevated' : 'normal',
    };
  }

  private numberParam(value: unknown, fallback: number): number {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : fallback;
  }

  private weightedAverage(current: number, trend: number, alpha: number): number {
    return current * (1 - alpha) + trend * alpha;
  }

  private confidence(sampleSize: number, minimum: number): number {
    return Number(Math.min(0.94, Math.max(minimum, minimum + sampleSize / 500)).toFixed(2));
  }

  private average(values: number[]): number {
    if (!values.length) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
  }
}
