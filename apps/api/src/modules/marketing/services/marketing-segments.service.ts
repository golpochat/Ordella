import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { CreateMarketingSegmentDto, UpdateMarketingSegmentDto } from '../dto';
import { MarketingBehaviorEventEntity, MarketingSegmentEntity } from '../entities';

type SegmentFilters = {
  minOrderCount?: number;
  maxOrderCount?: number;
  lastOrderBefore?: string;
  lastOrderAfter?: string;
  minTotalSpend?: number;
  maxTotalSpend?: number;
  minLoyaltyPoints?: number;
  minAvgOrderValue?: number;
  churnRisk?: 'low' | 'medium' | 'high';
  rfm?: 'champions' | 'loyal' | 'at_risk' | 'new';
  behaviorEvent?: 'view' | 'click' | 'purchase';
  minViews?: number;
  minClicks?: number;
  minPurchases?: number;
  minFrequency?: number;
  maxFrequency?: number;
  locationId?: string;
  orderType?: string;
  categoryPurchased?: string;
  newVsReturning?: 'new' | 'returning';
  crmSegment?: string;
  tag?: string;
};

@Injectable()
export class MarketingSegmentsService {
  constructor(
    @InjectRepository(MarketingSegmentEntity)
    private readonly segments: Repository<MarketingSegmentEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(MarketingBehaviorEventEntity)
    private readonly behaviorEvents: Repository<MarketingBehaviorEventEntity>,
  ) {}

  list(tenant: TenantContext): Promise<MarketingSegmentEntity[]> {
    return this.segments.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
  }

  async create(tenant: TenantContext, dto: CreateMarketingSegmentDto): Promise<MarketingSegmentEntity> {
    return this.segments.save(this.segments.create({
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      filters: dto.filters,
      builderType: dto.builderType ?? 'custom',
      ruleSummary: dto.ruleSummary ?? this.summarizeRules(dto.filters),
    }));
  }

  async update(tenant: TenantContext, id: string, dto: UpdateMarketingSegmentDto): Promise<MarketingSegmentEntity> {
    const segment = await this.requireSegment(tenant.tenantId, id);
    segment.name = dto.name.trim();
    segment.filters = dto.filters;
    segment.builderType = dto.builderType ?? segment.builderType ?? 'custom';
    segment.ruleSummary = dto.ruleSummary ?? this.summarizeRules(dto.filters);
    return this.segments.save(segment);
  }

  async delete(tenant: TenantContext, id: string): Promise<void> {
    await this.requireSegment(tenant.tenantId, id);
    await this.segments.delete({ id, tenantId: tenant.tenantId });
  }

  async preview(tenant: TenantContext, segmentId: string): Promise<CustomerEntity[]> {
    const segment = await this.requireSegment(tenant.tenantId, segmentId);
    const customers = await this.matchCustomers(tenant.tenantId, segment.filters);
    return customers.map((customer) => this.toPreviewCustomer(customer)) as CustomerEntity[];
  }

  async matchCustomers(tenantId: string, filters: Record<string, unknown>): Promise<CustomerEntity[]> {
    const customers = await this.customers.find({ where: { tenantId }, take: 500 });
    const typed = filters as SegmentFilters;
    const matches: CustomerEntity[] = [];

    for (const customer of customers) {
      const orders = await this.orders.find({
        where: { tenantId, customerId: customer.id },
        order: { createdAt: 'DESC' },
        take: 100,
      });
      if (!this.matchesCustomer(customer, orders, typed)) continue;
      if (typed.categoryPurchased && !(await this.hasPurchasedCategory(orders, typed.categoryPurchased))) continue;
      if (!(await this.matchesBehaviorEvents(tenantId, customer.id, typed))) continue;
      matches.push(customer);
    }

    return matches;
  }

  findCustomer(tenantId: string, customerId: string): Promise<CustomerEntity | null> {
    return this.customers.findOne({ where: { tenantId, id: customerId } });
  }

  saveCustomer(customer: CustomerEntity): Promise<CustomerEntity> {
    return this.customers.save(customer);
  }

  private async requireSegment(tenantId: string, id: string): Promise<MarketingSegmentEntity> {
    const segment = await this.segments.findOne({ where: { tenantId, id } });
    if (!segment) throw new NotFoundException('Segment not found');
    return segment;
  }

  private matchesCustomer(customer: CustomerEntity, orders: OrderEntity[], filters: SegmentFilters): boolean {
    const orderCount = orders.length;
    const totalSpend = Number(customer.lifetimeValue);
    const avgOrderValue = Number(customer.avgOrderValue ?? 0);
    const daysSinceLastOrder = customer.lastOrderAt
      ? (Date.now() - customer.lastOrderAt.getTime()) / 86_400_000
      : Number.POSITIVE_INFINITY;
    if (filters.minOrderCount !== undefined && orderCount < Number(filters.minOrderCount)) return false;
    if (filters.maxOrderCount !== undefined && orderCount > Number(filters.maxOrderCount)) return false;
    if (filters.minTotalSpend !== undefined && totalSpend < Number(filters.minTotalSpend)) return false;
    if (filters.maxTotalSpend !== undefined && totalSpend > Number(filters.maxTotalSpend)) return false;
    if (filters.minAvgOrderValue !== undefined && avgOrderValue < Number(filters.minAvgOrderValue)) return false;
    if (filters.minLoyaltyPoints !== undefined && customer.pointsBalance < Number(filters.minLoyaltyPoints)) return false;
    if (filters.minFrequency !== undefined && orderCount < Number(filters.minFrequency)) return false;
    if (filters.maxFrequency !== undefined && orderCount > Number(filters.maxFrequency)) return false;
    if (filters.churnRisk === 'high' && daysSinceLastOrder <= 60) return false;
    if (filters.churnRisk === 'medium' && (daysSinceLastOrder <= 30 || daysSinceLastOrder > 60)) return false;
    if (filters.churnRisk === 'low' && daysSinceLastOrder > 30) return false;
    if (filters.rfm === 'champions' && (totalSpend < 500 || orderCount < 5 || daysSinceLastOrder > 30)) return false;
    if (filters.rfm === 'loyal' && (orderCount < 3 || daysSinceLastOrder > 60)) return false;
    if (filters.rfm === 'at_risk' && (orderCount < 2 || daysSinceLastOrder <= 60)) return false;
    if (filters.rfm === 'new' && orderCount > 1) return false;
    if (filters.crmSegment && !(customer.segments ?? []).includes(filters.crmSegment)) return false;
    if (filters.tag && !(customer.tags ?? []).includes(filters.tag)) return false;
    if (filters.locationId && !orders.some((order) => order.locationId === filters.locationId)) return false;
    if (filters.orderType && !orders.some((order) => order.orderType === filters.orderType)) return false;
    if (filters.newVsReturning === 'new' && orderCount > 1) return false;
    if (filters.newVsReturning === 'returning' && orderCount <= 1) return false;
    if (filters.lastOrderBefore && customer.lastOrderAt && customer.lastOrderAt >= new Date(filters.lastOrderBefore)) return false;
    if (filters.lastOrderAfter && customer.lastOrderAt && customer.lastOrderAt <= new Date(filters.lastOrderAfter)) return false;
    return true;
  }

  private async hasPurchasedCategory(orders: OrderEntity[], categoryId: string): Promise<boolean> {
    const orderIds = orders.map((order) => order.id);
    if (!orderIds.length) return false;
    const count = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin('products', 'product', 'product.id = item.product_id')
      .where('item.order_id IN (:...orderIds)', { orderIds })
      .andWhere('product.category_id = :categoryId', { categoryId })
      .getCount();
    return count > 0;
  }

  private async matchesBehaviorEvents(
    tenantId: string,
    customerId: string,
    filters: SegmentFilters,
  ): Promise<boolean> {
    const checks: Array<[SegmentFilters['behaviorEvent'], number | undefined]> = [
      ['view', filters.minViews],
      ['click', filters.minClicks],
      ['purchase', filters.minPurchases],
      [filters.behaviorEvent, filters.behaviorEvent ? 1 : undefined],
    ];
    for (const [eventType, minimum] of checks) {
      if (!eventType || minimum === undefined) continue;
      const count = await this.behaviorEvents.count({ where: { tenantId, customerId, eventType } });
      if (count < Number(minimum)) return false;
    }
    return true;
  }

  private toPreviewCustomer(customer: CustomerEntity) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      pointsBalance: customer.pointsBalance,
      lifetimeValue: customer.lifetimeValue,
      lastOrderAt: customer.lastOrderAt,
    };
  }

  private summarizeRules(filters: Record<string, unknown>): Array<Record<string, unknown>> {
    return Object.entries(filters).map(([field, value]) => ({ field, operator: 'matches', value }));
  }
}
