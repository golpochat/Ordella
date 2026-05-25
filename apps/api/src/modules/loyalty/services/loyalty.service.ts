import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { parseMoney } from '../../orders/domain/order-totals.util';
import {
  CustomerEntity,
  LoyaltySettingsEntity,
  LoyaltyTransactionEntity,
  LoyaltyTransactionType,
} from '../entities';
import {
  CustomerSearchDto,
  LoyaltyAdjustmentDto,
  LoyaltyRedeemQuoteDto,
  LoyaltyTransactionQueryDto,
  UpdateLoyaltySettingsDto,
  UpsertCustomerDto,
} from '../dto';
import { SearchIndexService } from '../../search';

export type LoyaltyCustomerInput = {
  name?: string;
  email?: string | null;
  phone?: string | null;
};

export type LoyaltyRedemptionQuote = {
  allowed: boolean;
  points: number;
  discountAmount: string;
  message?: string;
};

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly transactions: Repository<LoyaltyTransactionEntity>,
    @InjectRepository(LoyaltySettingsEntity)
    private readonly settings: Repository<LoyaltySettingsEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    private readonly notifications: NotificationsService,
    private readonly searchIndex: SearchIndexService,
  ) {}

  async getSettings(tenantId: string): Promise<LoyaltySettingsEntity> {
    const existing = await this.settings.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.settings.save(this.settings.create({ tenantId }));
  }

  async updateSettings(tenant: TenantContext, dto: UpdateLoyaltySettingsDto): Promise<LoyaltySettingsEntity> {
    const settings = await this.getSettings(tenant.tenantId);
    if (dto.isEnabled !== undefined) settings.isEnabled = dto.isEnabled;
    if (dto.earnRate !== undefined) settings.earnRate = dto.earnRate.toString();
    if (dto.redeemRate !== undefined) settings.redeemRate = dto.redeemRate.toString();
    if (dto.autoEnroll !== undefined) settings.autoEnroll = dto.autoEnroll;
    if (dto.minRedeemPoints !== undefined) settings.minRedeemPoints = Math.floor(dto.minRedeemPoints);
    if (dto.maxRedeemPercent !== undefined) settings.maxRedeemPercent = Math.floor(dto.maxRedeemPercent);
    return this.settings.save(settings);
  }

  async upsertCustomer(tenant: TenantContext, dto: UpsertCustomerDto): Promise<CustomerEntity> {
    const customer = await this.findOrCreateCustomer(tenant.tenantId, dto, true);
    if (!customer) throw new BadRequestException('Customer details are required');
    await this.searchIndex.indexCustomer(customer);
    return customer;
  }

  async findOrCreateCustomer(
    tenantId: string,
    input: LoyaltyCustomerInput,
    forceCreate = false,
  ): Promise<CustomerEntity | null> {
    const settings = await this.getSettings(tenantId);
    if (!settings.autoEnroll && !forceCreate) return null;

    const email = this.normalizeEmail(input.email);
    const phone = this.normalizePhone(input.phone);
    if (!email && !phone && !forceCreate) return null;

    const existing = await this.findCustomerByContact(tenantId, email, phone);
    if (existing) {
      const name = input.name?.trim();
      if (name && (!existing.name || existing.name === 'Guest customer')) existing.name = name;
      if (email && !existing.email) existing.email = email;
      if (phone && !existing.phone) existing.phone = phone;
      const saved = await this.customers.save(existing);
      await this.searchIndex.indexCustomer(saved);
      return saved;
    }

    const name = input.name?.trim() || email || phone || 'Guest customer';
    const saved = await this.customers.save(
      this.customers.create({
        tenantId,
        name,
        email,
        phone,
      }),
    );
    await this.searchIndex.indexCustomer(saved);
    return saved;
  }

  async searchCustomers(tenant: TenantContext, query: CustomerSearchDto): Promise<CustomerEntity[]> {
    const q = query.q?.trim();
    const email = this.normalizeEmail(query.email);
    const phone = this.normalizePhone(query.phone);
    const where = [];
    if (email) where.push({ tenantId: tenant.tenantId, email: ILike(`%${email}%`) });
    if (phone) where.push({ tenantId: tenant.tenantId, phone: ILike(`%${phone}%`) });
    if (q) {
      where.push({ tenantId: tenant.tenantId, name: ILike(`%${q}%`) });
      where.push({ tenantId: tenant.tenantId, email: ILike(`%${q.toLowerCase()}%`) });
      where.push({ tenantId: tenant.tenantId, phone: ILike(`%${q}%`) });
    }
    return this.customers.find({
      where: where.length ? where : { tenantId: tenant.tenantId },
      order: { lastOrderAt: 'DESC', createdAt: 'DESC' },
      take: 25,
    });
  }

  async getCustomerProfile(tenant: TenantContext, customerId: string): Promise<CustomerEntity & { transactions: LoyaltyTransactionEntity[] }> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId: tenant.tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const transactions = await this.transactions.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return Object.assign(customer, { transactions });
  }

  async getCustomerOrders(tenant: TenantContext, customerId: string): Promise<OrderEntity[]> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId: tenant.tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.orders.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 25,
    });
  }

  async listTransactions(tenant: TenantContext, query: LoyaltyTransactionQueryDto): Promise<LoyaltyTransactionEntity[]> {
    const createdAt = query.from && query.to
      ? Between(new Date(query.from), new Date(query.to))
      : query.from
        ? MoreThanOrEqual(new Date(query.from))
        : query.to
          ? LessThanOrEqual(new Date(query.to))
          : undefined;
    return this.transactions.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.customerId ? { customerId: query.customerId } : {}),
        ...(query.type ? { type: query.type } : {}),
        ...(createdAt ? { createdAt } : {}),
      },
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async quoteRedemption(tenantId: string, dto: LoyaltyRedeemQuoteDto): Promise<LoyaltyRedemptionQuote> {
    const settings = await this.getSettings(tenantId);
    if (!settings.isEnabled) return { allowed: false, points: dto.points, discountAmount: '0.00', message: 'Loyalty is disabled' };
    if (dto.points < settings.minRedeemPoints) {
      return { allowed: false, points: dto.points, discountAmount: '0.00', message: `Minimum redemption is ${settings.minRedeemPoints} points` };
    }

    const customer = await this.customers.findOne({ where: { id: dto.customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.pointsBalance < dto.points) {
      return { allowed: false, points: dto.points, discountAmount: '0.00', message: 'Not enough points available' };
    }

    const requested = dto.points * parseMoney(settings.redeemRate);
    const orderTotal = dto.orderTotal ? parseMoney(dto.orderTotal) : null;
    const maxDiscount = orderTotal === null ? requested : orderTotal * (settings.maxRedeemPercent / 100);
    const discountAmount = Math.min(requested, maxDiscount);
    const usablePoints = Math.floor(discountAmount / parseMoney(settings.redeemRate));
    if (usablePoints <= 0) {
      return { allowed: false, points: dto.points, discountAmount: '0.00', message: 'No reward value can be applied' };
    }
    return { allowed: true, points: Math.min(dto.points, usablePoints), discountAmount: discountAmount.toFixed(2) };
  }

  async earnForCompletedOrder(tenant: TenantContext, order: OrderEntity): Promise<void> {
    if (!order.customerId) return;
    const settings = await this.getSettings(tenant.tenantId);
    if (!settings.isEnabled) return;
    const alreadyEarned = await this.transactions.exists({
      where: { tenantId: tenant.tenantId, orderId: order.id, type: LoyaltyTransactionType.EARN },
    });
    if (alreadyEarned) return;

    const total = parseMoney(order.total);
    const points = Math.floor(total * parseMoney(settings.earnRate));
    const customer = await this.customers.findOne({ where: { id: order.customerId, tenantId: tenant.tenantId } });
    if (!customer) return;

    const previousBalance = customer.pointsBalance;
    customer.pointsBalance += points;
    customer.lifetimeValue = (parseMoney(customer.lifetimeValue) + total).toFixed(2);
    customer.lastOrderAt = new Date();
    await this.customers.save(customer);
    await this.searchIndex.indexCustomer(customer);

    if (points > 0) {
      await this.transactions.save(this.transactions.create({
        tenantId: tenant.tenantId,
        customerId: customer.id,
        points,
        type: LoyaltyTransactionType.EARN,
        orderId: order.id,
      }));
      await this.notify(customer, points, 'earned');
      if (previousBalance < settings.minRedeemPoints && customer.pointsBalance >= settings.minRedeemPoints) {
        await this.notify(customer, customer.pointsBalance, 'unlocked');
      }
    }
  }

  async redeemForOrder(tenantId: string, customerId: string, points: number, orderId: string | null): Promise<LoyaltyTransactionEntity> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.pointsBalance < points) throw new BadRequestException('Not enough points available');
    customer.pointsBalance -= points;
    await this.customers.save(customer);
    await this.searchIndex.indexCustomer(customer);
    const transaction = await this.transactions.save(this.transactions.create({
      tenantId,
      customerId,
      points: -Math.abs(points),
      type: LoyaltyTransactionType.REDEEM,
      orderId,
    }));
    await this.notify(customer, points, 'redeemed');
    return transaction;
  }

  async adjustPoints(tenant: TenantContext, dto: LoyaltyAdjustmentDto): Promise<LoyaltyTransactionEntity> {
    const customer = await this.customers.findOne({ where: { id: dto.customerId, tenantId: tenant.tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const nextBalance = customer.pointsBalance + dto.points;
    if (nextBalance < 0) throw new BadRequestException('Adjustment would make points negative');
    customer.pointsBalance = nextBalance;
    await this.customers.save(customer);
    await this.searchIndex.indexCustomer(customer);
    return this.transactions.save(this.transactions.create({
      tenantId: tenant.tenantId,
      customerId: customer.id,
      points: dto.points,
      type: LoyaltyTransactionType.ADJUSTMENT,
      orderId: null,
    }));
  }

  async getAnalytics(tenant: TenantContext): Promise<Record<string, unknown>> {
    const [issued, redeemed, customerCount, topCustomers, orderCustomerRows] = await Promise.all([
      this.transactions.sum('points', { tenantId: tenant.tenantId, type: LoyaltyTransactionType.EARN }),
      this.transactions.sum('points', { tenantId: tenant.tenantId, type: LoyaltyTransactionType.REDEEM }),
      this.customers.count({ where: { tenantId: tenant.tenantId } }),
      this.customers.find({ where: { tenantId: tenant.tenantId }, order: { pointsBalance: 'DESC', lifetimeValue: 'DESC' }, take: 5 }),
      this.orders
        .createQueryBuilder('order')
        .select('order.customer_id', 'customerId')
        .addSelect('COUNT(order.id)', 'orderCount')
        .where('order.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('order.customer_id IS NOT NULL')
        .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
        .groupBy('order.customer_id')
        .getRawMany<{ customerId: string; orderCount: string }>(),
    ]);
    const issuedPoints = issued ?? 0;
    const redeemedPoints = Math.abs(redeemed ?? 0);
    const totalBalance = await this.customers.sum('pointsBalance', { tenantId: tenant.tenantId });
    const lifetimeValueResult = await this.customers
      .createQueryBuilder('customer')
      .select('COALESCE(SUM(customer.lifetime_value), 0)', 'value')
      .where('customer.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .getRawOne<{ value: string }>();
    const lifetimeValue = lifetimeValueResult?.value ?? '0.00';
    const returningCustomers = orderCustomerRows.filter((row) => Number(row.orderCount) > 1).length;
    const orderingCustomers = orderCustomerRows.length;
    return {
      totalPointsIssued: issuedPoints,
      totalPointsRedeemed: redeemedPoints,
      breakage: totalBalance ?? 0,
      customerCount,
      newCustomers: Math.max(customerCount - returningCustomers, 0),
      returningCustomers,
      repeatOrderRate: orderingCustomers ? Number(((returningCustomers / orderingCustomers) * 100).toFixed(2)) : 0,
      customerLifetimeValue: Number(lifetimeValue).toFixed(2),
      topLoyalCustomers: topCustomers,
      topCustomers,
    };
  }

  private async findCustomerByContact(tenantId: string, email: string | null, phone: string | null): Promise<CustomerEntity | null> {
    if (email) {
      const byEmail = await this.customers.findOne({ where: { tenantId, email } });
      if (byEmail) return byEmail;
    }
    if (phone) return this.customers.findOne({ where: { tenantId, phone } });
    return null;
  }

  private normalizeEmail(email?: string | null): string | null {
    const normalized = email?.trim().toLowerCase();
    return normalized || null;
  }

  private normalizePhone(phone?: string | null): string | null {
    const normalized = phone?.trim();
    return normalized || null;
  }

  private async notify(
    customer: CustomerEntity,
    points: number,
    action: 'earned' | 'redeemed' | 'unlocked',
  ): Promise<void> {
    const recipient = customer.email ?? customer.phone;
    if (!recipient) return;
    const channel = customer.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS;
    await this.notifications.createAndSend(customer.tenantId, {
      type: NotificationType.CUSTOMER,
      channel,
      recipient,
      payload: {
        title:
          action === 'earned'
            ? 'You earned rewards points'
            : action === 'redeemed'
              ? 'You redeemed rewards points'
              : 'You unlocked a reward',
        message:
          action === 'earned'
            ? `You earned ${points} points.`
            : action === 'redeemed'
              ? `You redeemed ${points} points.`
              : `You now have ${points} points available for rewards.`,
        points,
        category: 'loyalty',
      },
    });
  }
}
