import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CategoryEntity, ProductEntity } from '../../catalog/entities';
import { GiftCardEntity, StoreCreditTransactionEntity } from '../../giftcards/entities';
import { CustomerEntity, LoyaltyTransactionEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { CrmCustomerQueryDto, TagCustomerDto } from '../dto';
import { CustomerInsightEntity } from '../entities';

type CustomerSnapshot = {
  customer: CustomerEntity;
  orders: OrderEntity[];
  categories: string[];
};

@Injectable()
export class CrmCustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(CustomerInsightEntity)
    private readonly insights: Repository<CustomerInsightEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly loyaltyTransactions: Repository<LoyaltyTransactionEntity>,
    @InjectRepository(GiftCardEntity)
    private readonly giftCards: Repository<GiftCardEntity>,
    @InjectRepository(StoreCreditTransactionEntity)
    private readonly storeCreditTransactions: Repository<StoreCreditTransactionEntity>,
  ) {}

  async listCustomers(tenant: TenantContext, query: CrmCustomerQueryDto): Promise<CustomerEntity[]> {
    const term = query.q?.trim();
    const where = term
      ? [
          { tenantId: tenant.tenantId, name: ILike(`%${term}%`) },
          { tenantId: tenant.tenantId, email: ILike(`%${term.toLowerCase()}%`) },
          { tenantId: tenant.tenantId, phone: ILike(`%${term}%`) },
        ]
      : { tenantId: tenant.tenantId };
    const customers = await this.customers.find({ where, order: { lifetimeValue: 'DESC', createdAt: 'DESC' }, take: 200 });
    return customers.filter((customer) => {
      if (query.segment && !(customer.segments ?? []).includes(query.segment)) return false;
      if (query.tag && !(customer.tags ?? []).includes(query.tag)) return false;
      return true;
    });
  }

  async getCustomer(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const [orders, insight, loyalty, giftCards, storeCredit] = await Promise.all([
      this.orders.find({ where: { tenantId: tenant.tenantId, customerId }, order: { createdAt: 'DESC' }, take: 50 }),
      this.insights.findOne({ where: { tenantId: tenant.tenantId, customerId } }),
      this.loyaltyTransactions.find({ where: { tenantId: tenant.tenantId, customerId }, order: { createdAt: 'DESC' }, take: 50 }),
      this.giftCards.find({ where: { tenantId: tenant.tenantId, customerId }, order: { createdAt: 'DESC' }, take: 25 }),
      this.storeCreditTransactions.find({ where: { tenantId: tenant.tenantId, customerId }, order: { createdAt: 'DESC' }, take: 50 }),
    ]);
    return { ...customer, orders, insight, loyaltyTransactions: loyalty, giftCards, storeCreditTransactions: storeCredit };
  }

  async tagCustomer(tenant: TenantContext, dto: TagCustomerDto): Promise<CustomerEntity> {
    const customer = await this.requireCustomer(tenant.tenantId, dto.customerId);
    const current = new Set(customer.tags ?? []);
    if (dto.tags) {
      customer.tags = this.normalizeTags(dto.tags);
    } else {
      for (const tag of this.normalizeTags(dto.addTags ?? [])) current.add(tag);
      for (const tag of this.normalizeTags(dto.removeTags ?? [])) current.delete(tag);
      customer.tags = [...current].sort();
    }
    if (dto.notes !== undefined) customer.staffNotes = dto.notes.trim() || null;
    return this.customers.save(customer);
  }

  async refreshInsights(tenant: TenantContext, customerId?: string): Promise<{ updated: number }> {
    const customers = customerId
      ? [await this.requireCustomer(tenant.tenantId, customerId)]
      : await this.customers.find({ where: { tenantId: tenant.tenantId }, take: 1000 });
    const highValueThreshold = this.highValueThreshold(customers);
    for (const customer of customers) {
      await this.refreshCustomerInsight(tenant.tenantId, customer, highValueThreshold);
    }
    return { updated: customers.length };
  }

  async segments(tenant: TenantContext) {
    const customers = await this.customers.find({ where: { tenantId: tenant.tenantId } });
    const counts = new Map<string, number>();
    for (const customer of customers) {
      for (const segment of customer.segments ?? []) counts.set(segment, (counts.get(segment) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, customerCount]) => ({ name, customerCount }));
  }

  async insightsDashboard(tenant: TenantContext) {
    const customers = await this.customers.find({ where: { tenantId: tenant.tenantId } });
    const now = Date.now();
    const total = customers.length;
    const newCustomers = customers.filter((customer) => now - customer.createdAt.getTime() <= 30 * 86_400_000).length;
    const returning = customers.filter((customer) => customer.totalOrders > 1).length;
    const repeatOrderRate = total ? Number(((returning / total) * 100).toFixed(2)) : 0;
    const avgClv = total
      ? (customers.reduce((sum, customer) => sum + Number(customer.lifetimeValue), 0) / total).toFixed(2)
      : '0.00';
    const inactive = customers.filter((customer) => !customer.lastOrderAt || now - customer.lastOrderAt.getTime() > 60 * 86_400_000);
    const atRisk = inactive.filter((customer) => customer.totalOrders > 0);
    return {
      totalCustomers: total,
      newCustomersLast30Days: newCustomers,
      returningCustomers: returning,
      repeatOrderRate,
      averageLifetimeValue: avgClv,
      churnRiskCustomers: atRisk.length,
      topCustomers: [...customers].sort((a, b) => Number(b.lifetimeValue) - Number(a.lifetimeValue)).slice(0, 10),
      atRiskCustomers: atRisk.slice(0, 10),
      highValueCustomers: customers.filter((customer) => (customer.segments ?? []).includes('High-value customers')).slice(0, 10),
      inactiveCustomers: inactive.slice(0, 10),
      customerGrowth: this.groupByMonth(customers),
      valueDistribution: this.valueDistribution(customers),
      orderFrequencyDistribution: this.orderFrequencyDistribution(customers),
      segmentPerformance: await this.segments(tenant),
    };
  }

  private async refreshCustomerInsight(tenantId: string, customer: CustomerEntity, highValueThreshold: number): Promise<void> {
    const orders = await this.orders.find({ where: { tenantId, customerId: customer.id }, order: { createdAt: 'ASC' } });
    const categories = await this.categoriesPurchased(tenantId, orders.map((order) => order.id));
    const snapshot = { customer, orders, categories };
    const total = orders.reduce((sum, order) => sum + Number(order.total), 0);
    customer.totalOrders = orders.length;
    customer.lifetimeValue = total.toFixed(2);
    customer.avgOrderValue = orders.length ? (total / orders.length).toFixed(2) : '0.00';
    customer.firstOrderAt = orders[0]?.createdAt ?? null;
    customer.lastOrderAt = orders.at(-1)?.createdAt ?? customer.lastOrderAt;
    customer.preferredLocationId = this.preferredLocation(orders);
    customer.segments = this.generateSegments(snapshot, highValueThreshold);
    await this.customers.save(customer);

    const existing = await this.insights.findOne({ where: { tenantId, customerId: customer.id } });
    await this.insights.save(this.insights.create({
      ...(existing ?? {}),
      tenantId,
      customerId: customer.id,
      metrics: {
        lifetimeValue: customer.lifetimeValue,
        totalOrders: customer.totalOrders,
        avgOrderValue: customer.avgOrderValue,
        firstOrderAt: customer.firstOrderAt,
        lastOrderAt: customer.lastOrderAt,
        preferredLocationId: customer.preferredLocationId,
      },
      categoriesPurchased: categories,
      orderFrequency: this.orderFrequency(customer.firstOrderAt, customer.lastOrderAt, customer.totalOrders),
      churnRiskScore: this.churnRisk(customer),
    }));
  }

  private generateSegments({ customer, orders, categories }: CustomerSnapshot, highValueThreshold: number): string[] {
    const segments = new Set<string>();
    const lastOrderMs = customer.lastOrderAt?.getTime() ?? 0;
    if (Number(customer.lifetimeValue) >= highValueThreshold && highValueThreshold > 0) segments.add('High-value customers');
    if (orders.length >= 5) segments.add('Frequent buyers');
    if (!lastOrderMs || Date.now() - lastOrderMs > 60 * 86_400_000) segments.add('Inactive customers');
    if (orders.length <= 1) segments.add('New customers');
    if (orders.some((order) => order.orderType === 'pickup')) segments.add('Pickup customers');
    if (orders.some((order) => order.orderType === 'delivery')) segments.add('Delivery customers');
    if (new Set(orders.map((order) => order.locationId)).size > 1) segments.add('Multi-location customers');
    for (const category of categories) segments.add(`${category} buyers`);
    return [...segments].sort();
  }

  private async categoriesPurchased(tenantId: string, orderIds: string[]): Promise<string[]> {
    if (!orderIds.length) return [];
    const items = await this.orderItems.find({ where: orderIds.map((orderId) => ({ orderId })), take: 500 });
    const productIds = [...new Set(items.map((item) => item.productId))];
    if (!productIds.length) return [];
    const products = await this.products.find({ where: productIds.map((id) => ({ tenantId, id })) });
    const categoryIds = [...new Set(products.map((product) => product.categoryId).filter(Boolean))] as string[];
    if (!categoryIds.length) return [];
    const categories = await this.categories.find({ where: categoryIds.map((id) => ({ tenantId, id })) });
    return [...new Set(categories.map((category) => category.name))].sort();
  }

  private preferredLocation(orders: OrderEntity[]): string | null {
    const counts = new Map<string, number>();
    for (const order of orders) counts.set(order.locationId, (counts.get(order.locationId) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }

  private orderFrequency(first: Date | null, last: Date | null, totalOrders: number): string {
    if (totalOrders === 0) return 'no_orders';
    if (totalOrders === 1 || !first || !last) return 'one_time';
    const days = Math.max(1, (last.getTime() - first.getTime()) / 86_400_000);
    const cadence = days / Math.max(1, totalOrders - 1);
    if (cadence <= 7) return 'weekly';
    if (cadence <= 31) return 'monthly';
    return 'occasional';
  }

  private churnRisk(customer: CustomerEntity): string {
    if (!customer.lastOrderAt) return '75.00';
    const days = (Date.now() - customer.lastOrderAt.getTime()) / 86_400_000;
    return Math.min(100, Math.max(0, days > 60 ? 70 + days / 10 : days)).toFixed(2);
  }

  private highValueThreshold(customers: CustomerEntity[]): number {
    const values = customers.map((customer) => Number(customer.lifetimeValue)).sort((a, b) => a - b);
    return values[Math.max(0, Math.floor(values.length * 0.9) - 1)] ?? 0;
  }

  private groupByMonth(customers: CustomerEntity[]) {
    const counts = new Map<string, number>();
    for (const customer of customers) {
      const key = customer.createdAt.toISOString().slice(0, 7);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort().map(([month, count]) => ({ month, count }));
  }

  private valueDistribution(customers: CustomerEntity[]) {
    const buckets = [
      { label: '0', min: 0, max: 0 },
      { label: '1-100', min: 0.01, max: 100 },
      { label: '100-500', min: 100.01, max: 500 },
      { label: '500+', min: 500.01, max: Number.POSITIVE_INFINITY },
    ];
    return buckets.map((bucket) => ({
      label: bucket.label,
      count: customers.filter((customer) => {
        const value = Number(customer.lifetimeValue);
        return value >= bucket.min && value <= bucket.max;
      }).length,
    }));
  }

  private orderFrequencyDistribution(customers: CustomerEntity[]) {
    const labels = ['no_orders', 'one_time', 'weekly', 'monthly', 'occasional'];
    return labels.map((label) => ({
      label,
      count: customers.filter((customer) => this.orderFrequency(customer.firstOrderAt, customer.lastOrderAt, customer.totalOrders) === label).length,
    }));
  }

  private async requireCustomer(tenantId: string, id: string): Promise<CustomerEntity> {
    const customer = await this.customers.findOne({ where: { tenantId, id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private normalizeTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].sort();
  }
}
