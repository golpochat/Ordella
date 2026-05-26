import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductEntity } from '../../catalog/entities';
import { CustomerInsightEntity } from '../../crm/entities';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { MarketingSegmentEntity } from '../../marketing/entities';
import { NotificationsService } from '../../notifications/services';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { RecommendationEventEntity } from '../../recommendations/entities';
import { AnalyticsInsightsQueryDto, UpdateAnalyticsInsightSettingsDto } from '../dto';
import {
  AnalyticsInsightSettingsEntity,
  BasketAffinitySnapshotEntity,
  ChurnRiskSnapshotEntity,
  CustomerLtvSnapshotEntity,
  CustomerSegmentEntity,
} from '../entities';

type InsightSettings = {
  segmentationRules: Record<string, unknown>;
  ltvParameters: Record<string, unknown>;
  churnThresholds: Record<string, unknown>;
};

type ScoredCustomer = {
  customer: CustomerEntity;
  recencyDays: number;
  frequency: number;
  monetary: number;
  ltv: number;
  predictedLtv: number;
  churnRisk: number;
  churnBand: 'low' | 'medium' | 'high' | 'critical';
};

@Injectable()
export class AnalyticsInsightsService {
  constructor(
    @InjectRepository(AnalyticsInsightSettingsEntity)
    private readonly settings: Repository<AnalyticsInsightSettingsEntity>,
    @InjectRepository(CustomerSegmentEntity)
    private readonly segments: Repository<CustomerSegmentEntity>,
    @InjectRepository(CustomerLtvSnapshotEntity)
    private readonly ltvSnapshots: Repository<CustomerLtvSnapshotEntity>,
    @InjectRepository(ChurnRiskSnapshotEntity)
    private readonly churnSnapshots: Repository<ChurnRiskSnapshotEntity>,
    @InjectRepository(BasketAffinitySnapshotEntity)
    private readonly affinitySnapshots: Repository<BasketAffinitySnapshotEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(CustomerInsightEntity)
    private readonly customerInsights: Repository<CustomerInsightEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(MarketingSegmentEntity)
    private readonly marketingSegments: Repository<MarketingSegmentEntity>,
    @InjectRepository(RecommendationEventEntity)
    private readonly recommendationEvents: Repository<RecommendationEventEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async dashboard(tenant: TenantContext, query: AnalyticsInsightsQueryDto) {
    await this.ensureFreshSnapshots(tenant);
    const [settings, affinities, segments, scored, cohorts, recommendationSignals, marketingSegments] = await Promise.all([
      this.getSettings(tenant),
      this.affinitySnapshots.find({ where: { tenantId: tenant.tenantId }, order: { affinityScore: 'DESC' }, take: 30 }),
      this.segments.find({ where: { tenantId: tenant.tenantId }, order: { updatedAt: 'DESC' } }),
      this.scoredCustomers(tenant.tenantId, await this.ensureSettings(tenant.tenantId)),
      this.cohortAnalysis(tenant.tenantId, query),
      this.recommendationSummary(tenant.tenantId),
      this.marketingSegments.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 20 }),
    ]);
    const productIds = [...new Set(affinities.flatMap((row) => [row.productId, row.relatedProductId]))];
    const products = productIds.length ? await this.products.find({ where: { tenantId: tenant.tenantId, id: In(productIds) } }) : [];
    const productName = new Map(products.map((product) => [product.id, product.name]));
    const ltvValues = scored.map((row) => row.predictedLtv);
    const churnCounts = this.countBy(scored.map((row) => row.churnBand));

    return {
      generatedAt: new Date().toISOString(),
      locale: tenant.settings?.locale,
      currency: tenant.settings?.currency,
      timezone: tenant.settings?.timezone,
      settings,
      metrics: {
        customers: scored.length,
        averageLtv: this.average(ltvValues).toFixed(2),
        criticalChurnCustomers: churnCounts.critical ?? 0,
        highChurnCustomers: churnCounts.high ?? 0,
        affinityPairs: affinities.length,
        marketingSegments: marketingSegments.length,
      },
      basketAnalysis: {
        affinities: affinities.map((row) => ({
          productId: row.productId,
          productName: productName.get(row.productId) ?? row.productId,
          relatedProductId: row.relatedProductId,
          relatedProductName: productName.get(row.relatedProductId) ?? row.relatedProductId,
          orderCount: row.orderCount,
          support: Number(row.support),
          confidence: Number(row.confidence),
          lift: Number(row.lift),
          affinityScore: Number(row.affinityScore),
        })),
        network: this.networkGraph(affinities, productName),
      },
      segmentation: {
        segments: segments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          customerCount: segment.customerIds.length,
          rules: segment.rules,
          metrics: segment.metrics,
        })),
        clusters: this.clusterChart(scored),
        marketingAudiences: marketingSegments.map((segment) => ({ id: segment.id, name: segment.name, filters: segment.filters })),
      },
      ltv: {
        distribution: this.distribution(scored.map((row) => row.predictedLtv), [0, 100, 250, 500, 1000]),
        topCustomers: scored.slice(0, 10).map((row) => this.customerSummary(row)),
      },
      churn: {
        funnel: ['low', 'medium', 'high', 'critical'].map((band) => ({ band, count: churnCounts[band] ?? 0 })),
        atRiskCustomers: scored.filter((row) => row.churnBand === 'high' || row.churnBand === 'critical').slice(0, 10).map((row) => this.customerSummary(row)),
      },
      cohorts,
      recommendationSignals,
    };
  }

  async refresh(tenant: TenantContext) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const customers = await this.scoredCustomers(tenant.tenantId, settings);
    const snapshotDate = this.snapshotDate(tenant);
    await Promise.all([
      this.refreshAffinities(tenant.tenantId, snapshotDate),
      this.refreshCustomerSnapshots(tenant, customers, snapshotDate, settings),
      this.refreshSegments(tenant.tenantId, customers, settings),
      this.notifyChurnRisk(tenant.tenantId, customers, settings),
    ]);
    return { refreshedAt: new Date().toISOString(), customers: customers.length };
  }

  async productDetail(tenant: TenantContext, productId: string) {
    const product = await this.products.findOne({ where: { tenantId: tenant.tenantId, id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    await this.ensureFreshSnapshots(tenant);
    const affinities = await this.affinitySnapshots.find({
      where: [{ tenantId: tenant.tenantId, productId }, { tenantId: tenant.tenantId, relatedProductId: productId }],
      order: { affinityScore: 'DESC' },
      take: 25,
    });
    const relatedIds = [...new Set(affinities.flatMap((row) => [row.productId, row.relatedProductId]).filter((id) => id !== productId))];
    const related = relatedIds.length ? await this.products.find({ where: { tenantId: tenant.tenantId, id: In(relatedIds) } }) : [];
    const relatedName = new Map(related.map((item) => [item.id, item.name]));
    return {
      product: { id: product.id, name: product.name, sku: product.sku, categoryId: product.categoryId },
      affinities: affinities.map((row) => {
        const otherId = row.productId === productId ? row.relatedProductId : row.productId;
        return {
          productId: otherId,
          productName: relatedName.get(otherId) ?? otherId,
          affinityScore: Number(row.affinityScore),
          confidence: Number(row.confidence),
          lift: Number(row.lift),
          orderCount: row.orderCount,
        };
      }),
    };
  }

  async customerDetail(tenant: TenantContext, customerId: string) {
    const [customer, insight, ltv, churn, orders] = await Promise.all([
      this.customers.findOne({ where: { tenantId: tenant.tenantId, id: customerId } }),
      this.customerInsights.findOne({ where: { tenantId: tenant.tenantId, customerId } }),
      this.ltvSnapshots.find({ where: { tenantId: tenant.tenantId, customerId }, order: { snapshotDate: 'DESC' }, take: 12 }),
      this.churnSnapshots.find({ where: { tenantId: tenant.tenantId, customerId }, order: { snapshotDate: 'DESC' }, take: 12 }),
      this.orders.find({ where: { tenantId: tenant.tenantId, customerId }, order: { createdAt: 'DESC' }, take: 20 }),
    ]);
    if (!customer) throw new NotFoundException('Customer not found');
    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        segments: customer.segments,
        lifetimeValue: customer.lifetimeValue,
        totalOrders: customer.totalOrders,
      },
      insight,
      ltvTrend: ltv.map((row) => ({ date: row.snapshotDate, lifetimeValue: row.lifetimeValue, predictedLtv: row.predictedLtv })),
      churnTrend: churn.map((row) => ({ date: row.snapshotDate, riskScore: Number(row.riskScore), riskBand: row.riskBand, factors: row.factors })),
      recentOrders: orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status, createdAt: order.createdAt })),
    };
  }

  async cohortDetail(tenant: TenantContext, cohort: string, query: AnalyticsInsightsQueryDto) {
    const cohorts = await this.cohortAnalysis(tenant.tenantId, query);
    const match = cohorts.heatmap.find((row) => row.cohort === cohort);
    if (!match) throw new NotFoundException('Cohort not found');
    return { cohort, retention: match, revenue: cohorts.revenue.find((row) => row.cohort === cohort), orderFrequency: cohorts.orderFrequency.find((row) => row.cohort === cohort) };
  }

  async getSettings(tenant: TenantContext) {
    const settings = await this.ensureSettings(tenant.tenantId);
    return {
      tenantId: settings.tenantId,
      segmentationRules: settings.segmentationRules,
      ltvParameters: settings.ltvParameters,
      churnThresholds: settings.churnThresholds,
      updatedAt: settings.updatedAt?.toISOString() ?? null,
    };
  }

  async updateSettings(tenant: TenantContext, dto: UpdateAnalyticsInsightSettingsDto) {
    const current = await this.ensureSettings(tenant.tenantId);
    if (dto.segmentationRules) current.segmentationRules = { ...current.segmentationRules, ...dto.segmentationRules };
    if (dto.ltvParameters) current.ltvParameters = { ...current.ltvParameters, ...dto.ltvParameters };
    if (dto.churnThresholds) current.churnThresholds = { ...current.churnThresholds, ...dto.churnThresholds };
    return this.settings.save(current);
  }

  private async ensureFreshSnapshots(tenant: TenantContext) {
    const latest = await this.affinitySnapshots.findOne({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
    if (!latest || Date.now() - latest.createdAt.getTime() > 12 * 60 * 60 * 1000) {
      await this.refresh(tenant);
    }
  }

  private async ensureSettings(tenantId: string): Promise<AnalyticsInsightSettingsEntity> {
    const existing = await this.settings.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.settings.save(this.settings.create({ tenantId }));
  }

  private async scoredCustomers(tenantId: string, settings: AnalyticsInsightSettingsEntity): Promise<ScoredCustomer[]> {
    const customers = await this.customers.find({ where: { tenantId }, take: 2000 });
    const values = customers.map((customer) => Number(customer.lifetimeValue)).sort((a, b) => b - a);
    const maxValue = values[0] || 1;
    const predictionMonths = Number(settings.ltvParameters.predictionMonths ?? 6);
    const inactiveDays = Number(settings.churnThresholds.inactiveDays ?? 60);
    return customers
      .map((customer) => {
        const recencyDays = customer.lastOrderAt ? Math.floor((Date.now() - customer.lastOrderAt.getTime()) / 86_400_000) : 999;
        const frequency = customer.totalOrders;
        const monetary = Number(customer.lifetimeValue);
        const monthlyCadence = frequency > 1 && customer.firstOrderAt && customer.lastOrderAt
          ? frequency / Math.max(1, (customer.lastOrderAt.getTime() - customer.firstOrderAt.getTime()) / 2_592_000_000)
          : frequency > 0 ? 0.33 : 0;
        const predictedLtv = monetary + (monthlyCadence * Number(customer.avgOrderValue || 0) * predictionMonths);
        const recencyRisk = Math.min(100, (recencyDays / inactiveDays) * 55);
        const valueRisk = Math.max(0, 25 - ((monetary / maxValue) * 25));
        const frequencyRisk = frequency <= 1 ? 20 : frequency <= 3 ? 10 : 0;
        const churnRisk = Math.min(100, recencyRisk + valueRisk + frequencyRisk);
        return {
          customer,
          recencyDays,
          frequency,
          monetary,
          ltv: monetary,
          predictedLtv,
          churnRisk,
          churnBand: this.churnBand(churnRisk, settings.churnThresholds),
        };
      })
      .sort((a, b) => b.predictedLtv - a.predictedLtv);
  }

  private async refreshAffinities(tenantId: string, snapshotDate: string) {
    await this.affinitySnapshots.delete({ tenantId, snapshotDate });
    const rows = await this.orderItems
      .createQueryBuilder('a')
      .innerJoin(OrderItemEntity, 'b', 'b.order_id = a.order_id AND b.product_id <> a.product_id')
      .innerJoin(OrderEntity, 'order', 'order.id = a.order_id')
      .innerJoin(ProductEntity, 'product', 'product.id = a.product_id')
      .innerJoin(ProductEntity, 'related', 'related.id = b.product_id')
      .select('a.product_id', 'productId')
      .addSelect('b.product_id', 'relatedProductId')
      .addSelect('product.name', 'productName')
      .addSelect('related.name', 'relatedProductName')
      .addSelect('COUNT(DISTINCT a.order_id)', 'orderCount')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: [OrderStatus.CANCELLED, OrderStatus.FAILED] })
      .groupBy('a.product_id')
      .addGroupBy('b.product_id')
      .addGroupBy('product.name')
      .addGroupBy('related.name')
      .orderBy('COUNT(DISTINCT a.order_id)', 'DESC')
      .limit(100)
      .getRawMany<{ productId: string; relatedProductId: string; productName: string; relatedProductName: string; orderCount: string }>();
    const totalOrders = await this.orders.count({ where: { tenantId } });
    const productCounts = await this.productOrderCounts(tenantId);
    await this.affinitySnapshots.save(rows.map((row) => {
      const orderCount = Number(row.orderCount);
      const baseCount = productCounts.get(row.productId) ?? 1;
      const relatedCount = productCounts.get(row.relatedProductId) ?? 1;
      const support = totalOrders ? orderCount / totalOrders : 0;
      const confidence = orderCount / baseCount;
      const lift = confidence / (relatedCount / Math.max(1, totalOrders));
      return this.affinitySnapshots.create({
        tenantId,
        productId: row.productId,
        relatedProductId: row.relatedProductId,
        snapshotDate,
        orderCount,
        support: support.toFixed(4),
        confidence: confidence.toFixed(4),
        lift: Number.isFinite(lift) ? lift.toFixed(4) : '0.0000',
        affinityScore: (confidence * Math.max(1, lift) * 100).toFixed(2),
        metadata: { productName: row.productName, relatedProductName: row.relatedProductName },
      });
    }));
  }

  private async productOrderCounts(tenantId: string) {
    const rows = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
      .select('item.product_id', 'productId')
      .addSelect('COUNT(DISTINCT item.order_id)', 'count')
      .where('order.tenant_id = :tenantId', { tenantId })
      .groupBy('item.product_id')
      .getRawMany<{ productId: string; count: string }>();
    return new Map(rows.map((row) => [row.productId, Number(row.count)]));
  }

  private async refreshCustomerSnapshots(tenant: TenantContext, customers: ScoredCustomer[], snapshotDate: string, settings: AnalyticsInsightSettingsEntity) {
    await Promise.all([
      this.ltvSnapshots.delete({ tenantId: tenant.tenantId, snapshotDate }),
      this.churnSnapshots.delete({ tenantId: tenant.tenantId, snapshotDate }),
    ]);
    await this.ltvSnapshots.save(customers.map((row) => this.ltvSnapshots.create({
      tenantId: tenant.tenantId,
      customerId: row.customer.id,
      snapshotDate,
      lifetimeValue: row.ltv.toFixed(2),
      predictedLtv: row.predictedLtv.toFixed(2),
      avgOrderValue: row.customer.avgOrderValue,
      orderCount: row.customer.totalOrders,
      parameters: settings.ltvParameters,
    })));
    await this.churnSnapshots.save(customers.map((row) => this.churnSnapshots.create({
      tenantId: tenant.tenantId,
      customerId: row.customer.id,
      snapshotDate,
      riskScore: row.churnRisk.toFixed(2),
      riskBand: row.churnBand,
      factors: { recencyDays: row.recencyDays, frequency: row.frequency, lifetimeValue: row.monetary },
    })));
  }

  private async refreshSegments(tenantId: string, customers: ScoredCustomer[], settings: AnalyticsInsightSettingsEntity) {
    const percentile = Number(settings.segmentationRules.highValuePercentile ?? 0.8);
    const frequentOrders = Number(settings.segmentationRules.frequentBuyerOrders ?? 4);
    const newDays = Number(settings.segmentationRules.newCustomerDays ?? 30);
    const sortedValue = [...customers].sort((a, b) => a.predictedLtv - b.predictedLtv);
    const highValueCutoff = sortedValue[Math.floor(sortedValue.length * percentile)]?.predictedLtv ?? 0;
    const definitions = [
      { name: 'High LTV customers', rules: { predictedLtvGte: highValueCutoff }, rows: customers.filter((row) => row.predictedLtv >= highValueCutoff && highValueCutoff > 0) },
      { name: 'Frequent buyers', rules: { totalOrdersGte: frequentOrders }, rows: customers.filter((row) => row.frequency >= frequentOrders) },
      { name: 'Churn risk customers', rules: { churnBandIn: ['high', 'critical'] }, rows: customers.filter((row) => row.churnBand === 'high' || row.churnBand === 'critical') },
      { name: 'New customers', rules: { createdWithinDays: newDays }, rows: customers.filter((row) => Date.now() - row.customer.createdAt.getTime() <= newDays * 86_400_000) },
    ];
    for (const definition of definitions) {
      const existing = await this.segments.findOne({ where: { tenantId, name: definition.name } });
      await this.segments.save(this.segments.create({
        ...(existing ?? {}),
        tenantId,
        name: definition.name,
        rules: definition.rules,
        customerIds: definition.rows.map((row) => row.customer.id),
        metrics: {
          averageLtv: this.average(definition.rows.map((row) => row.predictedLtv)).toFixed(2),
          averageChurnRisk: this.average(definition.rows.map((row) => row.churnRisk)).toFixed(2),
        },
      }));
    }
  }

  private async notifyChurnRisk(tenantId: string, customers: ScoredCustomer[], settings: AnalyticsInsightSettingsEntity) {
    const criticalThreshold = Number(settings.churnThresholds.critical ?? 85);
    const critical = customers.filter((row) => row.churnRisk >= criticalThreshold).slice(0, 3);
    for (const row of critical) {
      await this.notifications.dispatchEvent(
        tenantId,
        'analytics.churn_risk',
        {
          templateName: 'analytics_churn_risk',
          title: 'Churn risk alert',
          message: `${row.customer.name} has a churn risk score of ${row.churnRisk.toFixed(0)}.`,
          customerName: row.customer.name,
          churnRiskScore: row.churnRisk.toFixed(0),
          predictedLtv: row.predictedLtv.toFixed(2),
        },
        { channel: NotificationChannelType.EMAIL, type: NotificationType.CUSTOMER },
      ).catch(() => undefined);
    }
  }

  private async cohortAnalysis(tenantId: string, query: AnalyticsInsightsQueryDto) {
    const orders = await this.orders.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
      take: 5000,
    });
    const customerFirst = new Map<string, Date>();
    for (const order of orders.filter((order) => order.customerId)) {
      if (!order.customerId || customerFirst.has(order.customerId)) continue;
      customerFirst.set(order.customerId, order.createdAt);
    }
    const cohorts = new Map<string, Map<number, { customers: Set<string>; revenue: number; orders: number }>>();
    for (const order of orders) {
      if (!order.customerId) continue;
      const first = customerFirst.get(order.customerId);
      if (!first) continue;
      const cohort = first.toISOString().slice(0, 7);
      if (query.from && cohort < query.from.slice(0, 7)) continue;
      if (query.to && cohort > query.to.slice(0, 7)) continue;
      const monthIndex = this.monthDiff(first, order.createdAt);
      const byMonth = cohorts.get(cohort) ?? new Map();
      const cell = byMonth.get(monthIndex) ?? { customers: new Set<string>(), revenue: 0, orders: 0 };
      cell.customers.add(order.customerId);
      cell.revenue += Number(order.total);
      cell.orders += 1;
      byMonth.set(monthIndex, cell);
      cohorts.set(cohort, byMonth);
    }
    const rows = [...cohorts.entries()].sort(([a], [b]) => a.localeCompare(b));
    return {
      heatmap: rows.map(([cohort, months]) => {
        const size = months.get(0)?.customers.size || 1;
        return {
          cohort,
          months: [...months.entries()].sort((a, b) => a[0] - b[0]).map(([month, value]) => ({
            month,
            customers: value.customers.size,
            retentionRate: Number(((value.customers.size / size) * 100).toFixed(2)),
          })),
        };
      }),
      revenue: rows.map(([cohort, months]) => ({
        cohort,
        months: [...months.entries()].sort((a, b) => a[0] - b[0]).map(([month, value]) => ({ month, revenue: value.revenue.toFixed(2) })),
      })),
      orderFrequency: rows.map(([cohort, months]) => ({
        cohort,
        months: [...months.entries()].sort((a, b) => a[0] - b[0]).map(([month, value]) => ({
          month,
          ordersPerCustomer: Number((value.orders / Math.max(1, value.customers.size)).toFixed(2)),
        })),
      })),
    };
  }

  private async recommendationSummary(tenantId: string) {
    const rows = await this.recommendationEvents
      .createQueryBuilder('event')
      .select('event.event_type', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.tenant_id = :tenantId', { tenantId })
      .groupBy('event.event_type')
      .getRawMany<{ eventType: string; count: string }>();
    return rows.map((row) => ({ eventType: row.eventType, count: Number(row.count) }));
  }

  private networkGraph(rows: BasketAffinitySnapshotEntity[], productName: Map<string, string>) {
    const ids = [...new Set(rows.flatMap((row) => [row.productId, row.relatedProductId]))];
    return {
      nodes: ids.map((id) => ({ id, label: productName.get(id) ?? id })),
      edges: rows.map((row) => ({ source: row.productId, target: row.relatedProductId, weight: Number(row.affinityScore) })),
    };
  }

  private clusterChart(customers: ScoredCustomer[]) {
    return customers.map((row) => ({
      customerId: row.customer.id,
      customerName: row.customer.name,
      x: row.recencyDays,
      y: row.frequency,
      size: Math.max(4, Math.min(28, row.predictedLtv / 50)),
      segment: row.churnBand === 'critical' || row.churnBand === 'high' ? 'at_risk' : row.frequency >= 4 ? 'loyal' : 'standard',
    })).slice(0, 100);
  }

  private distribution(values: number[], cuts: number[]) {
    return cuts.map((cut, index) => {
      const next = cuts[index + 1] ?? Number.POSITIVE_INFINITY;
      return {
        label: next === Number.POSITIVE_INFINITY ? `${cut}+` : `${cut}-${next}`,
        count: values.filter((value) => value >= cut && value < next).length,
      };
    });
  }

  private customerSummary(row: ScoredCustomer) {
    return {
      customerId: row.customer.id,
      name: row.customer.name,
      lifetimeValue: row.ltv.toFixed(2),
      predictedLtv: row.predictedLtv.toFixed(2),
      totalOrders: row.frequency,
      churnRisk: Number(row.churnRisk.toFixed(2)),
      churnBand: row.churnBand,
    };
  }

  private churnBand(score: number, thresholds: Record<string, unknown>): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= Number(thresholds.critical ?? 85)) return 'critical';
    if (score >= Number(thresholds.high ?? 65)) return 'high';
    if (score >= Number(thresholds.medium ?? 45)) return 'medium';
    return 'low';
  }

  private countBy(values: string[]) {
    return values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {});
  }

  private average(values: number[]) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  private snapshotDate(tenant: TenantContext) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tenant.settings?.timezone ?? 'UTC' }).format(new Date());
  }

  private monthDiff(from: Date, to: Date) {
    return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  }
}
