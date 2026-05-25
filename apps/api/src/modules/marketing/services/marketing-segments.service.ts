import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { CreateMarketingSegmentDto, UpdateMarketingSegmentDto } from '../dto';
import { MarketingSegmentEntity } from '../entities';

type SegmentFilters = {
  minOrderCount?: number;
  maxOrderCount?: number;
  lastOrderBefore?: string;
  lastOrderAfter?: string;
  minTotalSpend?: number;
  minLoyaltyPoints?: number;
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
  ) {}

  list(tenant: TenantContext): Promise<MarketingSegmentEntity[]> {
    return this.segments.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
  }

  async create(tenant: TenantContext, dto: CreateMarketingSegmentDto): Promise<MarketingSegmentEntity> {
    return this.segments.save(this.segments.create({
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      filters: dto.filters,
    }));
  }

  async update(tenant: TenantContext, id: string, dto: UpdateMarketingSegmentDto): Promise<MarketingSegmentEntity> {
    const segment = await this.requireSegment(tenant.tenantId, id);
    segment.name = dto.name.trim();
    segment.filters = dto.filters;
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
      matches.push(customer);
    }

    return matches;
  }

  private async requireSegment(tenantId: string, id: string): Promise<MarketingSegmentEntity> {
    const segment = await this.segments.findOne({ where: { tenantId, id } });
    if (!segment) throw new NotFoundException('Segment not found');
    return segment;
  }

  private matchesCustomer(customer: CustomerEntity, orders: OrderEntity[], filters: SegmentFilters): boolean {
    const orderCount = orders.length;
    const totalSpend = Number(customer.lifetimeValue);
    if (filters.minOrderCount !== undefined && orderCount < Number(filters.minOrderCount)) return false;
    if (filters.maxOrderCount !== undefined && orderCount > Number(filters.maxOrderCount)) return false;
    if (filters.minTotalSpend !== undefined && totalSpend < Number(filters.minTotalSpend)) return false;
    if (filters.minLoyaltyPoints !== undefined && customer.pointsBalance < Number(filters.minLoyaltyPoints)) return false;
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
}
