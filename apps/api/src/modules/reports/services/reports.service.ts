import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { FilterReportDateRangeDto } from '../dto';
import { SalesReportResponseDto } from '../dto';
import { OrdersReportResponseDto } from '../dto';
import { CustomersReportResponseDto } from '../dto';
import { InventoryReportResponseDto } from '../dto';
import { CreateExportReportDto } from '../dto';
import { ExportReportResponseDto } from '../dto';
import { CreateReportDto } from '../dto';
import { ReportResponseDto } from '../dto';
import { ReportExportFormat } from '../enums/report-export-format.enum';
import { ReportJobStatus } from '../enums/report-job-status.enum';
import { ReportDefinitionSlug } from '../enums/report-definition-slug.enum';
import {
  ReportEntity,
  ReportDefinitionEntity,
  ReportJobEntity,
  ReportResultEntity,
  ReportEventEntity,
  ReportSnapshotEntity,
} from '../entities';
import { CsvExportService } from '../integrations';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ProductEntity, CategoryEntity } from '../../catalog/entities';
import {
  StockItemEntity,
  StockMovementEntity,
  WastageRecordEntity,
} from '../../inventory/entities';
import { OrderTaxLineEntity } from '../../tax/entities/order-tax-line.entity';
import { CustomerEntity, LoyaltyTransactionEntity } from '../../loyalty/entities';
import { DeliveryTaskEntity, DriverProfileEntity } from '../../deliveries/entities';
import { DeliveryTaskStatus } from '../../deliveries/enums/delivery-task-status.enum';
import { WarehousePickTaskEntity } from '../../warehouse/entities';
import { PurchaseOrderEntity, SupplierEntity } from '../../procurement/entities';
import { ForecastSnapshotEntity } from '../../forecast/entities';
import { PromotionApplicationEntity, PromotionEntity } from '../../promotions/entities';
import { LocationEntity } from '../../tenants/entities';

const EXCLUDED_ORDER_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];
const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

type ReportRange = {
  from: Date;
  to: Date;
  fromIso: string;
  toIso: string;
  locationId?: string;
  channel?: string;
  categoryId?: string;
  productId?: string;
  supplierId?: string;
  staffId?: string;
  refresh: boolean;
};

@Injectable()
export class ReportsAnalyticsService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly stockMovements: Repository<StockMovementEntity>,
    @InjectRepository(WastageRecordEntity)
    private readonly wastageRecords: Repository<WastageRecordEntity>,
    @InjectRepository(OrderTaxLineEntity)
    private readonly taxLines: Repository<OrderTaxLineEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly loyaltyTransactions: Repository<LoyaltyTransactionEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    @InjectRepository(DriverProfileEntity)
    private readonly drivers: Repository<DriverProfileEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly purchaseOrders: Repository<PurchaseOrderEntity>,
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(ForecastSnapshotEntity)
    private readonly forecastSnapshots: Repository<ForecastSnapshotEntity>,
    @InjectRepository(PromotionEntity)
    private readonly promotions: Repository<PromotionEntity>,
    @InjectRepository(PromotionApplicationEntity)
    private readonly promotionApplications: Repository<PromotionApplicationEntity>,
    @InjectRepository(ReportSnapshotEntity)
    private readonly snapshots: Repository<ReportSnapshotEntity>,
    @InjectRepository(ReportJobEntity)
    private readonly reportJobs: Repository<ReportJobEntity>,
    @InjectRepository(ReportResultEntity)
    private readonly reportResults: Repository<ReportResultEntity>,
    @InjectRepository(ReportEventEntity)
    private readonly reportEvents: Repository<ReportEventEntity>,
    private readonly csvExport: CsvExportService,
  ) {}

  async getSummaryReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, 'summary', query, async (range) => {
      const [sales, inventory, customers, tax, delivery, warehouse, supplierSpend, analyticsSignals] =
        await Promise.all([
          this.buildSalesMetrics(tenant.tenantId, range),
          this.buildInventoryMetrics(tenant.tenantId, range),
          this.buildCustomerMetrics(tenant.tenantId, range),
          this.buildTaxMetrics(tenant.tenantId, range),
          this.buildDeliveryMetrics(tenant.tenantId, range),
          this.buildWarehouseMetrics(tenant.tenantId, range),
          this.buildSupplierSpend(tenant.tenantId, range),
          this.buildAnalyticsSignals(tenant.tenantId, range),
        ]);

      return {
        from: range.fromIso,
        to: range.toIso,
        locationId: range.locationId ?? null,
        revenue: sales.totalRevenue,
        orders: sales.orderCount,
        averageOrderValue: sales.averageOrderValue,
        revenueByLocation: sales.revenueByLocation,
        salesByChannel: sales.salesByChannel,
        topCategories: sales.revenueByCategory,
        topItems: sales.revenueByItem,
        taxCollected: tax.totalTax,
        inventoryValue: inventory.inventoryValue,
        customerMetrics: customers,
        deliveryPerformance: delivery,
        warehousePerformance: warehouse,
        supplierSpend,
        analyticsSignals,
        generatedAt: new Date().toISOString(),
      };
    });
  }

  async getDashboardReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, ReportDefinitionSlug.DASHBOARD, query, async (range) => {
      const [sales, inventory, delivery, supplier, promotions, forecastSignals] = await Promise.all([
        this.buildSalesMetrics(tenant.tenantId, range),
        this.buildInventoryMetrics(tenant.tenantId, range),
        this.buildDeliveryMetrics(tenant.tenantId, range),
        this.buildSupplierPerformanceMetrics(tenant.tenantId, range),
        this.buildPromotionPerformanceMetrics(tenant.tenantId, range),
        this.latestForecastSignals(tenant.tenantId, range),
      ]);

      return {
        from: range.fromIso,
        to: range.toIso,
        filters: this.serializeFilters(range),
        sales,
        inventory,
        delivery,
        supplier,
        promotions,
        forecastSignals,
        generatedAt: new Date().toISOString(),
      };
    });
  }

  async getProductDrilldown(
    tenant: TenantContext,
    productId: string,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, `drilldown-product-${productId}`, { ...query, productId }, async (range) => ({
      productId,
      filters: this.serializeFilters(range),
      sales: await this.buildSalesMetrics(tenant.tenantId, { ...range, productId }),
      inventory: await this.buildInventoryMetrics(tenant.tenantId, { ...range, productId }),
      generatedAt: new Date().toISOString(),
    }));
  }

  async getLocationDrilldown(
    tenant: TenantContext,
    locationId: string,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, `drilldown-location-${locationId}`, { ...query, locationId }, async (range) => ({
      locationId,
      filters: this.serializeFilters(range),
      sales: await this.buildSalesMetrics(tenant.tenantId, { ...range, locationId }),
      inventory: await this.buildInventoryMetrics(tenant.tenantId, { ...range, locationId }),
      delivery: await this.buildDeliveryMetrics(tenant.tenantId, { ...range, locationId }),
      supplier: await this.buildSupplierPerformanceMetrics(tenant.tenantId, { ...range, locationId }),
      generatedAt: new Date().toISOString(),
    }));
  }

  async getSupplierDrilldown(
    tenant: TenantContext,
    supplierId: string,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, `drilldown-supplier-${supplierId}`, { ...query, supplierId }, async (range) => ({
      supplierId,
      filters: this.serializeFilters(range),
      supplier: await this.buildSupplierPerformanceMetrics(tenant.tenantId, { ...range, supplierId }),
      generatedAt: new Date().toISOString(),
    }));
  }

  async getSalesReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<SalesReportResponseDto> {
    const payload = await this.withSnapshot(tenant, ReportDefinitionSlug.SALES, query, (range) =>
      this.buildSalesMetrics(tenant.tenantId, range),
    );
    return {
      from: String(payload.from),
      to: String(payload.to),
      locationId: (payload.locationId as string | null) ?? null,
      totalSales: String(payload.totalRevenue ?? '0.00'),
      orderCount: Number(payload.orderCount ?? 0),
      metrics: payload,
    };
  }

  async getOrdersReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<OrdersReportResponseDto> {
    const payload = await this.withSnapshot(tenant, ReportDefinitionSlug.ORDERS, query, (range) =>
      this.buildOrderMetrics(tenant.tenantId, range),
    );
    return {
      from: String(payload.from),
      to: String(payload.to),
      locationId: (payload.locationId as string | null) ?? null,
      metrics: payload,
    };
  }

  async getCustomersReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<CustomersReportResponseDto> {
    const payload = await this.withSnapshot(tenant, ReportDefinitionSlug.CUSTOMERS, query, (range) =>
      this.buildCustomerMetrics(tenant.tenantId, range),
    );
    return {
      from: String(payload.from),
      to: String(payload.to),
      metrics: payload,
    };
  }

  async getInventoryReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<InventoryReportResponseDto> {
    const payload = await this.withSnapshot(tenant, ReportDefinitionSlug.INVENTORY, query, (range) =>
      this.buildInventoryMetrics(tenant.tenantId, range),
    );
    return {
      from: String(payload.from),
      to: String(payload.to),
      locationId: (payload.locationId as string | null) ?? null,
      metrics: payload,
    };
  }

  async getTaxReport(
    tenant: TenantContext,
    query: FilterReportDateRangeDto,
  ): Promise<Record<string, unknown>> {
    return this.withSnapshot(tenant, ReportDefinitionSlug.TAX, query, (range) =>
      this.buildTaxMetrics(tenant.tenantId, range),
    );
  }

  async listExportJobs(tenant: TenantContext): Promise<ReportJobEntity[]> {
    return this.reportJobs.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async exportReport(
    tenant: TenantContext,
    dto: CreateExportReportDto,
    user?: AuthenticatedUser,
  ): Promise<ExportReportResponseDto> {
    const format = dto.format ?? ReportExportFormat.CSV;
    const query = {
      ...(dto.parameters ?? {}),
      locationId: dto.locationId ?? dto.parameters?.locationId,
      refresh: 'true',
    } as FilterReportDateRangeDto;
    const job = await this.reportJobs.save(this.reportJobs.create({
      tenantId: tenant.tenantId,
      reportId: null,
      definitionId: null,
      reportType: dto.reportType,
      format,
      status: ReportJobStatus.PENDING,
      parameters: query as Record<string, unknown>,
      locationId: dto.locationId ?? null,
      requestedBy: user?.id ?? null,
      fileUrl: null,
      startedAt: new Date(),
      completedAt: null,
      errorMessage: null,
    }));

    try {
      const report = await this.getReportByType(tenant, dto.reportType, query);
      const rows = this.flattenForExport(report);
      const fileUrl = this.buildFileUrl(format, rows);
      job.status = ReportJobStatus.COMPLETED;
      job.completedAt = new Date();
      job.fileUrl = fileUrl;
      await this.reportJobs.save(job);
      await this.reportResults.save(this.reportResults.create({
        jobId: job.id,
        format,
        storageRef: fileUrl,
        summary: { reportType: dto.reportType, rows: rows.length },
        rowCount: rows.length,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));
      return { jobId: job.id, status: job.status, fileUrl, reportType: dto.reportType, format, rowCount: rows.length };
    } catch (error) {
      job.status = ReportJobStatus.FAILED;
      job.errorMessage = error instanceof Error ? error.message : 'Report export failed';
      job.completedAt = new Date();
      await this.reportJobs.save(job);
      return { jobId: job.id, status: job.status, fileUrl: null, reportType: dto.reportType, format, rowCount: 0 };
    }
  }

  private async getReportByType(
    tenant: TenantContext,
    reportType: ReportDefinitionSlug,
    query: FilterReportDateRangeDto,
  ) {
    if (reportType === ReportDefinitionSlug.SUMMARY) return this.getSummaryReport(tenant, query);
    if (reportType === ReportDefinitionSlug.DASHBOARD) return this.getDashboardReport(tenant, query);
    if (reportType === ReportDefinitionSlug.SALES) return this.getSalesReport(tenant, query);
    if (reportType === ReportDefinitionSlug.ORDERS) return this.getOrdersReport(tenant, query);
    if (reportType === ReportDefinitionSlug.CUSTOMERS) return this.getCustomersReport(tenant, query);
    if (reportType === ReportDefinitionSlug.INVENTORY) return this.getInventoryReport(tenant, query);
    if (reportType === ReportDefinitionSlug.DELIVERY) return this.withSnapshot(tenant, ReportDefinitionSlug.DELIVERY, query, (range) =>
      this.buildDeliveryMetrics(tenant.tenantId, range),
    );
    if (reportType === ReportDefinitionSlug.SUPPLIER) return this.withSnapshot(tenant, ReportDefinitionSlug.SUPPLIER, query, (range) =>
      this.buildSupplierPerformanceMetrics(tenant.tenantId, range),
    );
    if (reportType === ReportDefinitionSlug.PROMOTIONS) return this.withSnapshot(tenant, ReportDefinitionSlug.PROMOTIONS, query, (range) =>
      this.buildPromotionPerformanceMetrics(tenant.tenantId, range),
    );
    if (reportType === ReportDefinitionSlug.TAX) return this.getTaxReport(tenant, query);
    return this.getSummaryReport(tenant, query);
  }

  private async withSnapshot<T extends Record<string, unknown>>(
    tenant: TenantContext,
    reportType: string,
    query: FilterReportDateRangeDto,
    build: (range: ReportRange) => Promise<T>,
  ): Promise<T> {
    const range = this.normalizeRange(query);
    const cacheKey = JSON.stringify({
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      channel: range.channel ?? null,
      categoryId: range.categoryId ?? null,
      productId: range.productId ?? null,
      supplierId: range.supplierId ?? null,
      staffId: range.staffId ?? null,
    });

    if (!range.refresh) {
      const cached = await this.snapshots
        .createQueryBuilder('snapshot')
        .where('snapshot.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('snapshot.report_type = :reportType', { reportType })
        .andWhere('snapshot.cache_key = :cacheKey', { cacheKey })
        .andWhere('(snapshot.expires_at IS NULL OR snapshot.expires_at > NOW())')
        .orderBy('snapshot.generated_at', 'DESC')
        .getOne();
      if (cached) return cached.payload as T;
    }

    const payload = await build(range);
    await this.snapshots.save(this.snapshots.create({
      tenantId: tenant.tenantId,
      reportType,
      cacheKey,
      payload,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + SNAPSHOT_TTL_MS),
    }));
    return payload;
  }

  private normalizeRange(query: FilterReportDateRangeDto): ReportRange {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return {
      from,
      to,
      fromIso: from.toISOString(),
      toIso: to.toISOString(),
      locationId: query.locationId,
      channel: query.channel,
      categoryId: query.categoryId,
      productId: query.productId,
      supplierId: query.supplierId,
      staffId: query.staffId,
      refresh: query.refresh === 'true',
    };
  }

  private async buildSalesMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const total = await this.baseOrderQuery(tenantId, range)
      .select('COUNT(*)', 'orderCount')
      .addSelect('COALESCE(SUM(o.total), 0)', 'totalRevenue')
      .addSelect('COALESCE(AVG(o.total), 0)', 'averageOrderValue')
      .getRawOne<{ orderCount: string; totalRevenue: string; averageOrderValue: string }>();
    const [revenueByLocation, salesByChannel, revenueByItem, revenueByCategory, dailyRevenue, weeklyRevenue, monthlyRevenue, paymentMethods, hourlySalesHeatmap] =
      await Promise.all([
        this.revenueByLocation(tenantId, range),
        this.salesByChannel(tenantId, range),
        this.revenueByItem(tenantId, range),
        this.revenueByCategory(tenantId, range),
        this.dailyRevenue(tenantId, range),
        this.periodRevenue(tenantId, range, 'week'),
        this.periodRevenue(tenantId, range, 'month'),
        this.paymentMethodMix(tenantId, range),
        this.hourlySalesHeatmap(tenantId, range),
      ]);

    return {
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      totalRevenue: this.money(total?.totalRevenue),
      orderCount: Number(total?.orderCount ?? 0),
      averageOrderValue: this.money(total?.averageOrderValue),
      revenueByLocation,
      salesByChannel,
      revenueByItem,
      revenueByCategory,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      paymentMethods,
      hourlySalesHeatmap,
    };
  }

  private async buildOrderMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const rows = await this.baseOrderQuery(tenantId, range)
      .select('o.status', 'status')
      .addSelect('o.order_type', 'channel')
      .addSelect('o.payment_method', 'paymentMethod')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .addSelect('COALESCE(SUM(o.discount_total), 0)', 'discounts')
      .groupBy('o.status')
      .addGroupBy('o.order_type')
      .addGroupBy('o.payment_method')
      .getRawMany<{ status: string; channel: string; paymentMethod: string | null; orders: string; revenue: string; discounts: string }>();
    return {
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      byStatusChannel: rows.map((row) => ({
        status: row.status,
        channel: row.channel,
        paymentMethod: row.paymentMethod,
        orders: Number(row.orders),
        revenue: this.money(row.revenue),
        discounts: this.money(row.discounts),
      })),
    };
  }

  private async buildInventoryMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const stockQb = this.stockItems
      .createQueryBuilder('s')
      .leftJoin(ProductEntity, 'p', 'p.id = s.product_id')
      .where('s.tenant_id = :tenantId', { tenantId })
      .select('COUNT(*)', 'itemCount')
      .addSelect('COALESCE(SUM(s.quantity_on_hand), 0)', 'quantityOnHand')
      .addSelect('COALESCE(SUM(s.quantity_reserved), 0)', 'quantityReserved')
      .addSelect('COALESCE(SUM(s.quantity_on_hand * COALESCE(p.price, 0)), 0)', 'inventoryValue');
    if (range.locationId) stockQb.andWhere('s.location_id = :locationId', { locationId: range.locationId });
    if (range.productId) stockQb.andWhere('s.product_id = :productId', { productId: range.productId });
    if (range.categoryId) stockQb.andWhere('p.category_id = :categoryId', { categoryId: range.categoryId });
    const stock = await stockQb.getRawOne<{ itemCount: string; quantityOnHand: string; quantityReserved: string; inventoryValue: string }>();

    const movementQb = this.stockMovements
      .createQueryBuilder('m')
      .innerJoin(StockItemEntity, 's', 's.id = m.stock_item_id')
      .where('m.tenant_id = :tenantId', { tenantId })
      .andWhere('m.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('m.type', 'type')
      .addSelect('COUNT(*)', 'movements')
      .addSelect('COALESCE(SUM(ABS(m.quantity)), 0)', 'quantity')
      .groupBy('m.type');
    if (range.locationId) movementQb.andWhere('s.location_id = :locationId', { locationId: range.locationId });
    if (range.productId) movementQb.andWhere('s.product_id = :productId', { productId: range.productId });
    const movements = await movementQb.getRawMany<{ type: string; movements: string; quantity: string }>();

    const wastageQb = this.wastageRecords
      .createQueryBuilder('w')
      .where('w.tenant_id = :tenantId', { tenantId })
      .andWhere('w.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('COALESCE(SUM(w.quantity), 0)', 'quantity')
      .addSelect('COUNT(*)', 'records');
    if (range.locationId) wastageQb.andWhere('w.location_id = :locationId', { locationId: range.locationId });
    const waste = await wastageQb.getRawOne<{ quantity: string; records: string }>();

    const stockLevels = await this.inventoryStockLevels(tenantId, range);
    const stockouts = stockLevels.filter((item) => item.status === 'stockout');
    const overstock = stockLevels.filter((item) => item.status === 'overstock');

    return {
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      itemCount: Number(stock?.itemCount ?? 0),
      quantityOnHand: Number(stock?.quantityOnHand ?? 0),
      quantityReserved: Number(stock?.quantityReserved ?? 0),
      inventoryValue: this.money(stock?.inventoryValue),
      stockouts: stockouts.length,
      overstock: overstock.length,
      stockLevels,
      stockMovements: movements.map((row) => ({ type: row.type, movements: Number(row.movements), quantity: Number(row.quantity) })),
      wasteShrinkage: { quantity: Number(waste?.quantity ?? 0), records: Number(waste?.records ?? 0) },
    };
  }

  private async buildCustomerMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const customerRows = await this.customers
      .createQueryBuilder('c')
      .where('c.tenant_id = :tenantId', { tenantId })
      .select('COUNT(*)', 'customerCount')
      .addSelect('COALESCE(SUM(c.lifetime_value), 0)', 'lifetimeValue')
      .addSelect('COALESCE(AVG(c.avg_order_value), 0)', 'averageCustomerOrderValue')
      .getRawOne<{ customerCount: string; lifetimeValue: string; averageCustomerOrderValue: string }>();
    const loyaltyRows = await this.loyaltyTransactions
      .createQueryBuilder('t')
      .where('t.tenant_id = :tenantId', { tenantId })
      .andWhere('t.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('t.type', 'type')
      .addSelect('COUNT(*)', 'transactions')
      .addSelect('COALESCE(SUM(t.points), 0)', 'points')
      .groupBy('t.type')
      .getRawMany<{ type: string; transactions: string; points: string }>();
    return {
      from: range.fromIso,
      to: range.toIso,
      customerCount: Number(customerRows?.customerCount ?? 0),
      lifetimeValue: this.money(customerRows?.lifetimeValue),
      averageCustomerOrderValue: this.money(customerRows?.averageCustomerOrderValue),
      loyaltyUsage: loyaltyRows.map((row) => ({ type: row.type, transactions: Number(row.transactions), points: Number(row.points) })),
    };
  }

  private async buildTaxMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.taxLines
      .createQueryBuilder('tax')
      .where('tax.tenant_id = :tenantId', { tenantId })
      .andWhere('tax.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('tax.tax_type', 'taxType')
      .addSelect('tax.tax_name', 'taxName')
      .addSelect('tax.tax_rate', 'taxRate')
      .addSelect('tax.price_mode', 'priceMode')
      .addSelect('tax.jurisdiction', 'jurisdiction')
      .addSelect('COALESCE(SUM(tax.taxable_amount), 0)', 'taxableAmount')
      .addSelect('COALESCE(SUM(tax.tax_amount), 0)', 'taxAmount')
      .groupBy('tax.tax_type')
      .addGroupBy('tax.tax_name')
      .addGroupBy('tax.tax_rate')
      .addGroupBy('tax.price_mode')
      .addGroupBy('tax.jurisdiction')
      .orderBy('taxAmount', 'DESC');
    if (range.locationId) qb.andWhere('tax.location_id = :locationId', { locationId: range.locationId });
    const rows = await qb.getRawMany<{ taxType: string; taxName: string; taxRate: string; priceMode: string; jurisdiction: string; taxableAmount: string; taxAmount: string }>();
    const totalTax = rows.reduce((sum, row) => sum + Number(row.taxAmount), 0);
    return {
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      totalTax: this.money(totalTax),
      lines: rows.map((row) => ({
        taxType: row.taxType,
        taxName: row.taxName,
        taxRate: row.taxRate,
        priceMode: row.priceMode,
        jurisdiction: row.jurisdiction,
        taxableAmount: this.money(row.taxableAmount),
        taxAmount: this.money(row.taxAmount),
      })),
    };
  }

  private async buildDeliveryMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.deliveries
      .createQueryBuilder('d')
      .innerJoin(OrderEntity, 'o', 'o.id = d.order_id')
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('d.status', 'status')
      .addSelect('COUNT(*)', 'deliveries')
      .addSelect('AVG(EXTRACT(EPOCH FROM (d.completed_at - d.started_at)) / 60)', 'avgMinutes')
      .groupBy('d.status');
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    const rows = await qb.getRawMany<{ status: string; deliveries: string; avgMinutes: string | null }>();
    const driverMetrics = await this.deliveryDriverMetrics(tenantId, range);
    const timing = await this.deliveryTimingMetrics(tenantId, range);
    return {
      totalDeliveries: rows.reduce((sum, row) => sum + Number(row.deliveries), 0),
      deliveriesByStatus: rows.map((row) => ({
        status: row.status,
        deliveries: Number(row.deliveries),
        averageMinutes: row.avgMinutes ? Number(Number(row.avgMinutes).toFixed(1)) : null,
      })),
      completedDeliveries: rows.filter((row) => row.status === DeliveryTaskStatus.DELIVERED).reduce((sum, row) => sum + Number(row.deliveries), 0),
      onTimeRate: timing.onTimeRate,
      delayedDeliveries: timing.delayedDeliveries,
      averageDeliveryMinutes: timing.averageDeliveryMinutes,
      driverMetrics,
    };
  }

  private async buildSupplierPerformanceMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.purchaseOrders
      .createQueryBuilder('po')
      .leftJoin(SupplierEntity, 'supplier', 'supplier.id = po.supplier_id')
      .where('po.tenant_id = :tenantId', { tenantId })
      .andWhere('po.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('po.supplier_id', 'supplierId')
      .addSelect("COALESCE(supplier.name, 'Supplier')", 'supplierName')
      .addSelect('COUNT(*)', 'purchaseOrders')
      .addSelect("SUM(CASE WHEN po.supplier_status = 'rejected' THEN 1 ELSE 0 END)", 'rejectedOrders')
      .addSelect("SUM(CASE WHEN po.status IN ('received', 'partial') THEN 1 ELSE 0 END)", 'receivedOrders')
      .addSelect("SUM(CASE WHEN po.expected_delivery_date IS NOT NULL AND po.received_at IS NOT NULL AND po.received_at::date <= po.expected_delivery_date THEN 1 ELSE 0 END)", 'onTimeOrders')
      .addSelect('AVG(EXTRACT(DAY FROM (po.received_at - po.sent_at)))', 'averageLeadTimeDays')
      .addSelect('COALESCE(SUM(po.total_cost), 0)', 'spend')
      .groupBy('po.supplier_id')
      .addGroupBy('supplier.name')
      .orderBy('spend', 'DESC')
      .limit(25);
    if (range.locationId) qb.andWhere('po.location_id = :locationId', { locationId: range.locationId });
    if (range.supplierId) qb.andWhere('po.supplier_id = :supplierId', { supplierId: range.supplierId });
    const rows = await qb.getRawMany<{
      supplierId: string;
      supplierName: string;
      purchaseOrders: string;
      rejectedOrders: string;
      receivedOrders: string;
      onTimeOrders: string;
      averageLeadTimeDays: string | null;
      spend: string;
    }>();
    const suppliers = rows.map((row) => {
      const purchaseOrders = Number(row.purchaseOrders);
      const receivedOrders = Number(row.receivedOrders);
      const rejectedOrders = Number(row.rejectedOrders);
      const onTimeOrders = Number(row.onTimeOrders);
      return {
        supplierId: row.supplierId,
        supplierName: row.supplierName,
        purchaseOrders,
        receivedOrders,
        rejectedOrders,
        rejectionRate: purchaseOrders ? Number(((rejectedOrders / purchaseOrders) * 100).toFixed(2)) : 0,
        onTimeDeliveryRate: receivedOrders ? Number(((onTimeOrders / receivedOrders) * 100).toFixed(2)) : 0,
        averageLeadTimeDays: row.averageLeadTimeDays ? Number(Number(row.averageLeadTimeDays).toFixed(1)) : null,
        spend: this.money(row.spend),
      };
    });
    return {
      suppliers,
      totalSpend: this.money(suppliers.reduce((sum, row) => sum + Number(row.spend), 0)),
      averageOnTimeRate: this.average(suppliers.map((row) => row.onTimeDeliveryRate)),
      averageLeadTimeDays: this.average(suppliers.map((row) => row.averageLeadTimeDays ?? 0)),
      rejectionRate: this.average(suppliers.map((row) => row.rejectionRate)),
    };
  }

  private async buildPromotionPerformanceMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.promotionApplications
      .createQueryBuilder('application')
      .leftJoin(PromotionEntity, 'promotion', 'promotion.id = application.promotion_id')
      .leftJoin(OrderEntity, 'o', 'o.id = application.order_id')
      .where('application.tenant_id = :tenantId', { tenantId })
      .andWhere('application.applied_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('application.promotion_id', 'promotionId')
      .addSelect("COALESCE(promotion.name, 'Promotion')", 'promotionName')
      .addSelect('COUNT(*)', 'applications')
      .addSelect('COUNT(DISTINCT application.order_id)', 'convertedOrders')
      .addSelect('COALESCE(SUM(application.discount_amount), 0)', 'discount')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy('application.promotion_id')
      .addGroupBy('promotion.name')
      .orderBy('revenue', 'DESC')
      .limit(25);
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    const promotions = await qb.getRawMany<{
      promotionId: string;
      promotionName: string;
      applications: string;
      convertedOrders: string;
      discount: string;
      revenue: string;
    }>();
    const activePromotions = await this.promotions.count({ where: { tenantId, isActive: true } });
    const rows = promotions.map((row) => {
      const revenue = Number(row.revenue);
      const discount = Number(row.discount);
      return {
        promotionId: row.promotionId,
        promotionName: row.promotionName,
        applications: Number(row.applications),
        convertedOrders: Number(row.convertedOrders),
        conversionRate: Number(row.applications) ? Number(((Number(row.convertedOrders) / Number(row.applications)) * 100).toFixed(2)) : 0,
        discount: this.money(discount),
        revenue: this.money(revenue),
        uplift: this.money(Math.max(0, revenue - discount)),
        roi: discount > 0 ? Number(((revenue - discount) / discount).toFixed(2)) : 0,
      };
    });
    return {
      activePromotions,
      totalApplications: rows.reduce((sum, row) => sum + row.applications, 0),
      totalDiscount: this.money(rows.reduce((sum, row) => sum + Number(row.discount), 0)),
      influencedRevenue: this.money(rows.reduce((sum, row) => sum + Number(row.revenue), 0)),
      promotions: rows,
    };
  }

  private async buildWarehouseMetrics(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.pickTasks
      .createQueryBuilder('task')
      .where('task.tenant_id = :tenantId', { tenantId })
      .andWhere('task.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'tasks')
      .addSelect('AVG(EXTRACT(EPOCH FROM (task.completed_at - task.started_at)) / 60)', 'avgPickMinutes')
      .groupBy('task.status');
    if (range.locationId) qb.andWhere('task.warehouse_id = :locationId', { locationId: range.locationId });
    const rows = await qb.getRawMany<{ status: string; tasks: string; avgPickMinutes: string | null }>();
    return {
      pickTasksByStatus: rows.map((row) => ({
        status: row.status,
        tasks: Number(row.tasks),
        averagePickMinutes: row.avgPickMinutes ? Number(Number(row.avgPickMinutes).toFixed(1)) : null,
      })),
    };
  }

  private async buildSupplierSpend(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const qb = this.purchaseOrders
      .createQueryBuilder('po')
      .where('po.tenant_id = :tenantId', { tenantId })
      .andWhere('po.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('po.supplier_id', 'supplierId')
      .addSelect('COUNT(*)', 'purchaseOrders')
      .addSelect('COALESCE(SUM(po.total_cost), 0)', 'spend')
      .groupBy('po.supplier_id')
      .orderBy('spend', 'DESC')
      .limit(20);
    if (range.locationId) qb.andWhere('po.location_id = :locationId', { locationId: range.locationId });
    if (range.supplierId) qb.andWhere('po.supplier_id = :supplierId', { supplierId: range.supplierId });
    const rows = await qb.getRawMany<{ supplierId: string; purchaseOrders: string; spend: string }>();
    return {
      totalSpend: this.money(rows.reduce((sum, row) => sum + Number(row.spend), 0)),
      suppliers: rows.map((row) => ({ supplierId: row.supplierId, purchaseOrders: Number(row.purchaseOrders), spend: this.money(row.spend) })),
    };
  }

  private async buildAnalyticsSignals(tenantId: string, range: ReportRange): Promise<Record<string, unknown>> {
    const rows = await this.reportEvents
      .createQueryBuilder('event')
      .where('event.tenant_id = :tenantId', { tenantId })
      .andWhere('event.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('event.event_type', 'eventType')
      .addSelect('COUNT(*)', 'events')
      .groupBy('event.event_type')
      .orderBy('events', 'DESC')
      .getRawMany<{ eventType: string; events: string }>();
    return {
      storefront: rows.filter((row) => row.eventType.startsWith('STOREFRONT_')).map((row) => ({ eventType: row.eventType, events: Number(row.events) })),
      pos: rows.filter((row) => row.eventType.startsWith('POS_')).map((row) => ({ eventType: row.eventType, events: Number(row.events) })),
      warehouse: rows.filter((row) => row.eventType.startsWith('WAREHOUSE_')).map((row) => ({ eventType: row.eventType, events: Number(row.events) })),
      delivery: rows.filter((row) => row.eventType.startsWith('DELIVERY_')).map((row) => ({ eventType: row.eventType, events: Number(row.events) })),
    };
  }

  private baseOrderQuery(tenantId: string, range: ReportRange) {
    const qb = this.orders
      .createQueryBuilder('o')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES });
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    if (range.channel) qb.andWhere('o.order_type = :channel', { channel: range.channel });
    if (range.productId) {
      qb.andWhere('EXISTS (SELECT 1 FROM order_items oi_filter WHERE oi_filter.order_id = o.id AND oi_filter.product_id = :productId)', {
        productId: range.productId,
      });
    }
    if (range.categoryId) {
      qb.andWhere(`EXISTS (
        SELECT 1
        FROM order_items oi_category
        INNER JOIN products p_category ON p_category.id = oi_category.product_id
        WHERE oi_category.order_id = o.id AND p_category.category_id = :categoryId
      )`, { categoryId: range.categoryId });
    }
    return qb;
  }

  private async revenueByLocation(tenantId: string, range: ReportRange) {
    const qb = this.baseOrderQuery(tenantId, range)
      .leftJoin(LocationEntity, 'loc', 'loc.id = o.location_id')
      .select('o.location_id', 'locationId')
      .addSelect("COALESCE(loc.name, 'Unknown location')", 'locationName')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy('o.location_id')
      .addGroupBy('loc.name')
      .orderBy('revenue', 'DESC');
    const rows = await qb.getRawMany<{ locationId: string; locationName: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ locationId: row.locationId, locationName: row.locationName, orders: Number(row.orders), revenue: this.money(row.revenue) }));
  }

  private async salesByChannel(tenantId: string, range: ReportRange) {
    const rows = await this.baseOrderQuery(tenantId, range)
      .select('o.order_type', 'channel')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy('o.order_type')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ channel: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ channel: row.channel, orders: Number(row.orders), revenue: this.money(row.revenue) }));
  }

  private async revenueByItem(tenantId: string, range: ReportRange) {
    const qb = this.orderItems
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .leftJoin(ProductEntity, 'p', 'p.id = item.product_id')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .select('item.product_id', 'productId')
      .addSelect("COALESCE(p.name, 'Item')", 'productName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(item.quantity * item.price), 0)', 'revenue')
      .groupBy('item.product_id')
      .addGroupBy('p.name')
      .orderBy('revenue', 'DESC')
      .limit(20);
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    if (range.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: range.categoryId });
    if (range.productId) qb.andWhere('item.product_id = :productId', { productId: range.productId });
    const rows = await qb.getRawMany<{ productId: string; productName: string; quantitySold: string; revenue: string }>();
    return rows.map((row) => ({ productId: row.productId, productName: row.productName, quantitySold: Number(row.quantitySold), revenue: this.money(row.revenue) }));
  }

  private async revenueByCategory(tenantId: string, range: ReportRange) {
    const qb = this.orderItems
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .leftJoin(ProductEntity, 'p', 'p.id = item.product_id')
      .leftJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .andWhere('o.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .select('p.category_id', 'categoryId')
      .addSelect("COALESCE(c.name, 'Uncategorized')", 'categoryName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(item.quantity * item.price), 0)', 'revenue')
      .groupBy('p.category_id')
      .addGroupBy('c.name')
      .orderBy('revenue', 'DESC')
      .limit(20);
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    if (range.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: range.categoryId });
    if (range.productId) qb.andWhere('item.product_id = :productId', { productId: range.productId });
    const rows = await qb.getRawMany<{ categoryId: string | null; categoryName: string; quantitySold: string; revenue: string }>();
    return rows.map((row) => ({ categoryId: row.categoryId, categoryName: row.categoryName, quantitySold: Number(row.quantitySold), revenue: this.money(row.revenue) }));
  }

  private async dailyRevenue(tenantId: string, range: ReportRange) {
    const rows = await this.baseOrderQuery(tenantId, range)
      .select("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ date: row.date, orders: Number(row.orders), revenue: this.money(row.revenue) }));
  }

  private async periodRevenue(tenantId: string, range: ReportRange, period: 'week' | 'month') {
    const expression = period === 'week'
      ? "TO_CHAR(DATE_TRUNC('week', o.created_at AT TIME ZONE 'UTC'), 'IYYY-IW')"
      : "TO_CHAR(DATE_TRUNC('month', o.created_at AT TIME ZONE 'UTC'), 'YYYY-MM')";
    const rows = await this.baseOrderQuery(tenantId, range)
      .select(expression, 'period')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy(expression)
      .orderBy('period', 'ASC')
      .getRawMany<{ period: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ period: row.period, orders: Number(row.orders), revenue: this.money(row.revenue) }));
  }

  private async paymentMethodMix(tenantId: string, range: ReportRange) {
    const rows = await this.baseOrderQuery(tenantId, range)
      .select("COALESCE(o.payment_method, 'unknown')", 'paymentMethod')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy("COALESCE(o.payment_method, 'unknown')")
      .orderBy('orders', 'DESC')
      .getRawMany<{ paymentMethod: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ paymentMethod: row.paymentMethod, orders: Number(row.orders), revenue: this.money(row.revenue) }));
  }

  private async hourlySalesHeatmap(tenantId: string, range: ReportRange) {
    const rows = await this.baseOrderQuery(tenantId, range)
      .select("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'Dy')", 'day')
      .addSelect("EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'UTC')", 'hour')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .groupBy("TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'Dy')")
      .addGroupBy("EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'UTC')")
      .orderBy('hour', 'ASC')
      .getRawMany<{ day: string; hour: string; orders: string; revenue: string }>();
    return rows.map((row) => ({
      day: row.day.trim(),
      hour: Number(row.hour),
      orders: Number(row.orders),
      revenue: this.money(row.revenue),
    }));
  }

  private async inventoryStockLevels(tenantId: string, range: ReportRange) {
    const qb = this.stockItems
      .createQueryBuilder('s')
      .leftJoin(ProductEntity, 'p', 'p.id = s.product_id')
      .leftJoin(CategoryEntity, 'c', 'c.id = p.category_id')
      .where('s.tenant_id = :tenantId', { tenantId })
      .select('s.product_id', 'productId')
      .addSelect('s.location_id', 'locationId')
      .addSelect("COALESCE(p.name, s.name)", 'name')
      .addSelect("COALESCE(c.name, 'Uncategorized')", 'categoryName')
      .addSelect('s.quantity_on_hand', 'quantityOnHand')
      .addSelect('s.quantity_reserved', 'quantityReserved')
      .addSelect('s.reorder_level', 'reorderLevel')
      .addSelect('s.safety_stock_level', 'safetyStockLevel')
      .orderBy('s.quantity_on_hand', 'ASC')
      .limit(100);
    if (range.locationId) qb.andWhere('s.location_id = :locationId', { locationId: range.locationId });
    if (range.productId) qb.andWhere('s.product_id = :productId', { productId: range.productId });
    if (range.categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId: range.categoryId });
    const rows = await qb.getRawMany<{
      productId: string | null;
      locationId: string;
      name: string;
      categoryName: string;
      quantityOnHand: string;
      quantityReserved: string;
      reorderLevel: string | null;
      safetyStockLevel: string | null;
    }>();
    return rows.map((row) => {
      const available = Number(row.quantityOnHand) - Number(row.quantityReserved);
      const reorderLevel = Number(row.reorderLevel ?? 0);
      const safetyStock = Number(row.safetyStockLevel ?? 0);
      const overstockThreshold = Math.max(reorderLevel, safetyStock, 1) * 3;
      const status = available <= 0 ? 'stockout' : available <= Math.max(reorderLevel, safetyStock) ? 'low' : available >= overstockThreshold ? 'overstock' : 'healthy';
      return {
        productId: row.productId,
        locationId: row.locationId,
        name: row.name,
        categoryName: row.categoryName,
        quantityOnHand: Number(row.quantityOnHand),
        quantityReserved: Number(row.quantityReserved),
        available: Number(available.toFixed(2)),
        reorderLevel,
        safetyStock,
        status,
      };
    });
  }

  private async deliveryTimingMetrics(tenantId: string, range: ReportRange) {
    const qb = this.deliveries
      .createQueryBuilder('d')
      .innerJoin(OrderEntity, 'o', 'o.id = d.order_id')
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select("SUM(CASE WHEN d.status = 'delivered' THEN 1 ELSE 0 END)", 'completed')
      .addSelect("SUM(CASE WHEN d.status = 'delivered' AND d.eta IS NOT NULL AND d.completed_at IS NOT NULL AND d.completed_at <= d.eta THEN 1 ELSE 0 END)", 'onTime')
      .addSelect("SUM(CASE WHEN d.eta IS NOT NULL AND d.completed_at IS NOT NULL AND d.completed_at > d.eta THEN 1 ELSE 0 END)", 'delayed')
      .addSelect('AVG(EXTRACT(EPOCH FROM (d.completed_at - d.started_at)) / 60)', 'avgMinutes');
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    const row = await qb.getRawOne<{ completed: string | null; onTime: string | null; delayed: string | null; avgMinutes: string | null }>();
    const completed = Number(row?.completed ?? 0);
    const onTime = Number(row?.onTime ?? 0);
    return {
      onTimeRate: completed ? Number(((onTime / completed) * 100).toFixed(2)) : 0,
      delayedDeliveries: Number(row?.delayed ?? 0),
      averageDeliveryMinutes: row?.avgMinutes ? Number(Number(row.avgMinutes).toFixed(1)) : null,
    };
  }

  private async deliveryDriverMetrics(tenantId: string, range: ReportRange) {
    const qb = this.deliveries
      .createQueryBuilder('d')
      .innerJoin(OrderEntity, 'o', 'o.id = d.order_id')
      .leftJoin(DriverProfileEntity, 'driver', 'driver.id = d.driver_profile_id')
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.created_at BETWEEN :from AND :to', { from: range.from, to: range.to })
      .select('d.driver_profile_id', 'driverId')
      .addSelect("COALESCE(driver.name, 'Unassigned')", 'driverName')
      .addSelect('COUNT(*)', 'deliveries')
      .addSelect("SUM(CASE WHEN d.status = 'delivered' THEN 1 ELSE 0 END)", 'completed')
      .addSelect("SUM(CASE WHEN d.eta IS NOT NULL AND d.completed_at IS NOT NULL AND d.completed_at <= d.eta THEN 1 ELSE 0 END)", 'onTime')
      .addSelect('AVG(EXTRACT(EPOCH FROM (d.completed_at - d.started_at)) / 60)', 'avgMinutes')
      .groupBy('d.driver_profile_id')
      .addGroupBy('driver.name')
      .orderBy('deliveries', 'DESC')
      .limit(20);
    if (range.locationId) qb.andWhere('o.location_id = :locationId', { locationId: range.locationId });
    const rows = await qb.getRawMany<{ driverId: string | null; driverName: string; deliveries: string; completed: string; onTime: string; avgMinutes: string | null }>();
    return rows.map((row) => {
      const completed = Number(row.completed);
      return {
        driverId: row.driverId,
        driverName: row.driverName,
        deliveries: Number(row.deliveries),
        completed,
        onTimeRate: completed ? Number(((Number(row.onTime) / completed) * 100).toFixed(2)) : 0,
        averageMinutes: row.avgMinutes ? Number(Number(row.avgMinutes).toFixed(1)) : null,
      };
    });
  }

  private async latestForecastSignals(tenantId: string, range: ReportRange) {
    const rows = await this.forecastSnapshots.find({
      where: { tenantId },
      order: { generatedAt: 'DESC' },
      take: 8,
    });
    return rows
      .filter((row) => !range.locationId || row.locationId === range.locationId || row.locationId === null)
      .map((row) => ({
        forecastType: row.forecastType,
        locationId: row.locationId,
        horizonDays: row.horizonDays,
        confidence: row.confidence,
        generatedForDate: row.generatedForDate,
        generatedAt: row.generatedAt.toISOString(),
      }));
  }

  private serializeFilters(range: ReportRange) {
    return {
      from: range.fromIso,
      to: range.toIso,
      locationId: range.locationId ?? null,
      channel: range.channel ?? null,
      categoryId: range.categoryId ?? null,
      productId: range.productId ?? null,
      supplierId: range.supplierId ?? null,
    };
  }

  private average(values: number[]) {
    const valid = values.filter((value) => Number.isFinite(value));
    if (!valid.length) return 0;
    return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(2));
  }

  private flattenForExport(report: unknown): Array<Record<string, unknown>> {
    if (!report || typeof report !== 'object') return [];
    const rows: Array<Record<string, unknown>> = [];
    const walk = (prefix: string, value: unknown) => {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            rows.push({ section: prefix, ...(item as Record<string, unknown>) });
          } else {
            rows.push({ section: prefix, value: item });
          }
        }
        return;
      }
      if (value && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value)) {
          walk(prefix ? `${prefix}.${key}` : key, nested);
        }
        return;
      }
      rows.push({ metric: prefix, value });
    };
    walk('', report);
    return rows;
  }

  private buildFileUrl(format: ReportExportFormat, rows: Array<Record<string, unknown>>) {
    if (format === ReportExportFormat.JSON) {
      return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(rows))}`;
    }
    if (format === ReportExportFormat.PDF) {
      return this.buildPdfDataUrl(rows);
    }
    const csv = this.csvExport.serialize(rows);
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }

  private buildPdfDataUrl(rows: Array<Record<string, unknown>>) {
    const lines = rows
      .slice(0, 80)
      .map((row) => Object.entries(row).map(([key, value]) => `${key}: ${String(value)}`).join(' | '))
      .join('\\n')
      .replace(/[()\\]/g, '');
    const text = `Ordella Report\\nGenerated ${new Date().toISOString()}\\n\\n${lines || 'No rows'}`;
    const content = [
      'BT',
      '/F1 10 Tf',
      '40 780 Td',
      ...text.split('\\n').slice(0, 90).flatMap((line, index) => [
        index === 0 ? `(${line.slice(0, 110)}) Tj` : `0 -12 Td (${line.slice(0, 110)}) Tj`,
      ]),
      'ET',
    ].join('\\n');
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${content.length} >> stream\\n${content}\\nendstream endobj`,
    ];
    let pdf = '%PDF-1.4\\n';
    const offsets: number[] = [0];
    for (const object of objects) {
      offsets.push(pdf.length);
      pdf += `${object}\\n`;
    }
    const xrefOffset = pdf.length;
    pdf += `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n`;
    pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \\n`).join('');
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xrefOffset}\\n%%EOF`;
    return `data:application/pdf;base64,${Buffer.from(pdf).toString('base64')}`;
  }

  private money(value: string | number | null | undefined): string {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
  }
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reports: Repository<ReportEntity>,
    @InjectRepository(ReportDefinitionEntity)
    private readonly definitions: Repository<ReportDefinitionEntity>,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<ReportResponseDto[]> {
    const rows = await this.reports.find({
      where: { tenantId: tenant.tenantId },
      relations: { definition: true },
      order: { createdAt: 'DESC' },
      skip: ((query.page ?? 1) - 1) * (query.limit ?? 20),
      take: query.limit ?? 20,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(tenant: TenantContext, dto: CreateReportDto): Promise<ReportResponseDto> {
    const definition = await this.definitions.findOne({ where: { slug: dto.definitionSlug } });
    if (!definition) throw new NotFoundException('Report definition not found');
    const row = await this.reports.save(this.reports.create({
      tenantId: tenant.tenantId,
      definitionId: definition.id,
      definition,
      name: dto.name ?? null,
      parameters: dto.parameters ?? {},
      locationId: dto.locationId ?? null,
      requestedBy: null,
    }));
    return this.toResponse(row);
  }

  async findOne(tenant: TenantContext, id: string): Promise<ReportResponseDto> {
    const row = await this.reports.findOne({
      where: { id, tenantId: tenant.tenantId },
      relations: { definition: true },
    });
    if (!row) throw new NotFoundException('Report not found');
    return this.toResponse(row);
  }

  private toResponse(row: ReportEntity): ReportResponseDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      definitionId: row.definitionId,
      definitionSlug: row.definition?.slug ?? ReportDefinitionSlug.SUMMARY,
      name: row.name,
      parameters: row.parameters,
      status: row.status,
      locationId: row.locationId,
      requestedBy: row.requestedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
