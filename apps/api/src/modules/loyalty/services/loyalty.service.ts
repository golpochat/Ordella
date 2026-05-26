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
  LoyaltyPointsEntity,
  LoyaltyReferralEntity,
  LoyaltyRewardEntity,
  LoyaltySettingsEntity,
  LoyaltyTierEntity,
  LoyaltyTransactionEntity,
  LoyaltyTransactionType,
} from '../entities';
import {
  CreateReferralDto,
  CustomerSearchDto,
  LoyaltyAdjustmentDto,
  LoyaltyRedeemQuoteDto,
  LoyaltyTransactionQueryDto,
  UpdateLoyaltySettingsDto,
  UpsertLoyaltyRewardDto,
  UpsertLoyaltyTierDto,
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

type LoyaltyTransactionSource = 'order' | 'promotion' | 'referral' | 'manual' | 'fraud' | 'system';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(LoyaltyPointsEntity)
    private readonly points: Repository<LoyaltyPointsEntity>,
    @InjectRepository(LoyaltyReferralEntity)
    private readonly referrals: Repository<LoyaltyReferralEntity>,
    @InjectRepository(LoyaltyRewardEntity)
    private readonly rewards: Repository<LoyaltyRewardEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly transactions: Repository<LoyaltyTransactionEntity>,
    @InjectRepository(LoyaltySettingsEntity)
    private readonly settings: Repository<LoyaltySettingsEntity>,
    @InjectRepository(LoyaltyTierEntity)
    private readonly tiers: Repository<LoyaltyTierEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    private readonly notifications: NotificationsService,
    private readonly searchIndex: SearchIndexService,
  ) {}

  async getSettings(tenantId: string): Promise<LoyaltySettingsEntity> {
    const existing = await this.settings.findOne({ where: { tenantId } });
    if (existing) {
      await this.ensureDefaultTiers(tenantId);
      return existing;
    }
    const saved = await this.settings.save(this.settings.create({ tenantId }));
    await this.ensureDefaultTiers(tenantId);
    return saved;
  }

  async updateSettings(tenant: TenantContext, dto: UpdateLoyaltySettingsDto): Promise<LoyaltySettingsEntity> {
    const settings = await this.getSettings(tenant.tenantId);
    if (dto.isEnabled !== undefined) settings.isEnabled = dto.isEnabled;
    if (dto.earnRate !== undefined) settings.earnRate = dto.earnRate.toString();
    if (dto.redeemRate !== undefined) settings.redeemRate = dto.redeemRate.toString();
    if (dto.autoEnroll !== undefined) settings.autoEnroll = dto.autoEnroll;
    if (dto.minRedeemPoints !== undefined) settings.minRedeemPoints = Math.floor(dto.minRedeemPoints);
    if (dto.maxRedeemPercent !== undefined) settings.maxRedeemPercent = Math.floor(dto.maxRedeemPercent);
    if (dto.currency !== undefined) settings.currency = this.normalizeCurrency(dto.currency);
    if (dto.pointsExpireDays !== undefined) settings.pointsExpireDays = Math.floor(dto.pointsExpireDays);
    if (dto.referralEnabled !== undefined) settings.referralEnabled = dto.referralEnabled;
    if (dto.referrerBonusPoints !== undefined) settings.referrerBonusPoints = Math.floor(dto.referrerBonusPoints);
    if (dto.refereeBonusPoints !== undefined) settings.refereeBonusPoints = Math.floor(dto.refereeBonusPoints);
    if (dto.maxDailyRedemptions !== undefined) settings.maxDailyRedemptions = Math.floor(dto.maxDailyRedemptions);
    if (dto.maxDailyReferrals !== undefined) settings.maxDailyReferrals = Math.floor(dto.maxDailyReferrals);
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
      await this.ensurePointsRecord(saved);
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
    await this.ensurePointsRecord(saved);
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
    const [points, tier, availableRewards, referral] = await Promise.all([
      this.ensurePointsRecord(customer),
      this.resolveTier(customer),
      this.listAvailableRewardsForCustomer(tenant, customerId),
      this.getReferralSummary(tenant, customerId),
    ]);
    return Object.assign(customer, { transactions, points, tier, availableRewards, referral });
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
    const fraud = await this.checkRedemptionFraud(tenantId, dto.customerId, settings);
    if (fraud) return { allowed: false, points: dto.points, discountAmount: '0.00', message: fraud };
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

    const customer = await this.customers.findOne({ where: { id: order.customerId, tenantId: tenant.tenantId } });
    if (!customer) return;
    const tierBefore = await this.resolveTier(customer);
    const total = parseMoney(order.total);
    const points = Math.floor(total * parseMoney(settings.earnRate) * parseMoney(tierBefore?.pointsMultiplier ?? '1'));

    const previousBalance = customer.pointsBalance;
    customer.lifetimeValue = (parseMoney(customer.lifetimeValue) + total).toFixed(2);
    customer.lastOrderAt = new Date();
    await this.customers.save(customer);

    if (points > 0) {
      await this.applyPointChange(customer, points, {
        tenantId: tenant.tenantId,
        type: LoyaltyTransactionType.EARN,
        source: 'order',
        orderId: order.id,
        reason: 'Order completed',
      });
      const tierAfter = await this.updateTier(customer);
      await this.searchIndex.indexCustomer(customer);
      await this.notify(customer, points, 'earned');
      if (previousBalance < settings.minRedeemPoints && customer.pointsBalance >= settings.minRedeemPoints) {
        await this.notify(customer, customer.pointsBalance, 'unlocked');
      }
      if (tierAfter && tierAfter.name !== tierBefore?.name) {
        await this.notifyTierUpgrade(customer, tierAfter.name);
      }
    }
  }

  async redeemForOrder(tenantId: string, customerId: string, points: number, orderId: string | null): Promise<LoyaltyTransactionEntity> {
    const settings = await this.getSettings(tenantId);
    const fraud = await this.checkRedemptionFraud(tenantId, customerId, settings);
    if (fraud) throw new BadRequestException(fraud);
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.pointsBalance < points) throw new BadRequestException('Not enough points available');
    const transaction = await this.applyPointChange(customer, -Math.abs(points), {
      tenantId,
      type: LoyaltyTransactionType.REDEEM,
      source: 'order',
      orderId,
      reason: 'Order redemption',
    });
    await this.searchIndex.indexCustomer(customer);
    await this.notify(customer, points, 'redeemed');
    return transaction;
  }

  async adjustPoints(tenant: TenantContext, dto: LoyaltyAdjustmentDto): Promise<LoyaltyTransactionEntity> {
    const customer = await this.customers.findOne({ where: { id: dto.customerId, tenantId: tenant.tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const nextBalance = customer.pointsBalance + dto.points;
    if (nextBalance < 0) throw new BadRequestException('Adjustment would make points negative');
    const transaction = await this.applyPointChange(customer, dto.points, {
      tenantId: tenant.tenantId,
      type: LoyaltyTransactionType.ADJUSTMENT,
      source: 'manual',
      orderId: null,
      reason: dto.reason ?? 'Manual adjustment',
    });
    await this.searchIndex.indexCustomer(customer);
    await this.updateTier(customer);
    return transaction;
  }

  async listTiers(tenant: TenantContext): Promise<LoyaltyTierEntity[]> {
    await this.ensureDefaultTiers(tenant.tenantId);
    return this.tiers.find({ where: { tenantId: tenant.tenantId }, order: { sortOrder: 'ASC', pointsThreshold: 'ASC' } });
  }

  async upsertTier(tenant: TenantContext, dto: UpsertLoyaltyTierDto): Promise<LoyaltyTierEntity> {
    const existing = dto.id ? await this.tiers.findOne({ where: { id: dto.id, tenantId: tenant.tenantId } }) : null;
    const tier = this.tiers.create({
      ...(existing ?? {}),
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      pointsThreshold: Math.floor(dto.pointsThreshold),
      spendThreshold: dto.spendThreshold.toFixed(2),
      pointsMultiplier: dto.pointsMultiplier.toString(),
      discountPercent: (dto.discountPercent ?? 0).toFixed(2),
      perks: dto.perks ?? [],
      sortOrder: dto.sortOrder ?? dto.pointsThreshold,
      isActive: dto.isActive ?? true,
    });
    return this.tiers.save(tier);
  }

  async listRewards(tenant: TenantContext): Promise<LoyaltyRewardEntity[]> {
    return this.rewards.find({ where: { tenantId: tenant.tenantId }, order: { pointsCost: 'ASC', createdAt: 'DESC' } });
  }

  async upsertReward(tenant: TenantContext, dto: UpsertLoyaltyRewardDto): Promise<LoyaltyRewardEntity> {
    const existing = dto.id ? await this.rewards.findOne({ where: { id: dto.id, tenantId: tenant.tenantId } }) : null;
    return this.rewards.save(
      this.rewards.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        name: dto.name.trim(),
        type: dto.type,
        pointsCost: Math.floor(dto.pointsCost),
        discountAmount: dto.discountAmount === undefined ? null : dto.discountAmount.toFixed(2),
        discountPercent: dto.discountPercent === undefined ? null : dto.discountPercent.toFixed(2),
        freeItemId: dto.freeItemId ?? null,
        tierNames: dto.tierNames ?? [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: dto.isActive ?? true,
        metadata: dto.metadata ?? {},
      }),
    );
  }

  async listAvailableRewardsForCustomer(tenant: TenantContext, customerId: string): Promise<LoyaltyRewardEntity[]> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId: tenant.tenantId } });
    if (!customer) return [];
    const tier = await this.resolveTier(customer);
    const rows = await this.listRewards(tenant);
    const now = Date.now();
    return rows.filter((reward) => {
      if (!reward.isActive) return false;
      if (reward.expiresAt && reward.expiresAt.getTime() <= now) return false;
      if (reward.pointsCost > customer.pointsBalance) return false;
      return !reward.tierNames.length || reward.tierNames.includes(tier?.name ?? 'Member');
    });
  }

  async listReferrals(tenant: TenantContext): Promise<LoyaltyReferralEntity[]> {
    return this.referrals.find({
      where: { tenantId: tenant.tenantId },
      relations: { referrer: true, referredCustomer: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async createReferral(tenant: TenantContext, dto: CreateReferralDto): Promise<LoyaltyReferralEntity> {
    const settings = await this.getSettings(tenant.tenantId);
    if (!settings.referralEnabled) throw new BadRequestException('Referrals are disabled');
    const referrer = await this.customers.findOne({ where: { id: dto.referrerCustomerId, tenantId: tenant.tenantId } });
    if (!referrer) throw new NotFoundException('Referrer not found');
    const fraud = await this.checkReferralFraud(tenant.tenantId, dto.referrerCustomerId, settings);
    if (fraud) throw new BadRequestException(fraud);
    const referredCustomerId = dto.referredCustomerId ?? null;
    if (referredCustomerId === referrer.id) throw new BadRequestException('Self-referrals are not allowed');
    const referral = await this.referrals.save(
      this.referrals.create({
        tenantId: tenant.tenantId,
        referrerCustomerId: referrer.id,
        referredCustomerId,
        code: (dto.code ?? this.generateReferralCode(referrer)).toUpperCase(),
        status: referredCustomerId ? 'converted' : 'pending',
        referrerBonusPoints: settings.referrerBonusPoints,
        refereeBonusPoints: settings.refereeBonusPoints,
        convertedAt: referredCustomerId ? new Date() : null,
      }),
    );
    if (referredCustomerId) {
      await this.rewardReferral(tenant, referral);
    }
    return referral;
  }

  async convertReferral(tenant: TenantContext, code: string, referredCustomerId: string): Promise<LoyaltyReferralEntity> {
    const referral = await this.referrals.findOne({ where: { tenantId: tenant.tenantId, code: code.trim().toUpperCase() } });
    if (!referral) throw new NotFoundException('Referral not found');
    if (referral.referrerCustomerId === referredCustomerId) throw new BadRequestException('Self-referrals are not allowed');
    if (referral.status === 'rewarded') return referral;
    referral.referredCustomerId = referredCustomerId;
    referral.status = 'converted';
    referral.convertedAt = new Date();
    const saved = await this.referrals.save(referral);
    return this.rewardReferral(tenant, saved);
  }

  async getCustomerRewardsOverview(tenant: TenantContext, customerId: string) {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId: tenant.tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const [points, tier, rewards, referral] = await Promise.all([
      this.ensurePointsRecord(customer),
      this.resolveTier(customer),
      this.listAvailableRewardsForCustomer(tenant, customerId),
      this.getReferralSummary(tenant, customerId),
    ]);
    return {
      points,
      tier,
      rewards,
      referral,
      currency: this.resolveCurrency(tenant, (await this.getSettings(tenant.tenantId)).currency ?? undefined),
    };
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

  private async applyPointChange(
    customer: CustomerEntity,
    points: number,
    options: {
      tenantId: string;
      type: LoyaltyTransactionType;
      source: LoyaltyTransactionSource;
      orderId: string | null;
      reason?: string | null;
      externalRef?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<LoyaltyTransactionEntity> {
    customer.pointsBalance += points;
    if (customer.pointsBalance < 0) throw new BadRequestException('Not enough points available');
    const savedCustomer = await this.customers.save(customer);
    const pointRecord = await this.ensurePointsRecord(savedCustomer);
    pointRecord.pointsBalance = savedCustomer.pointsBalance;
    if (points > 0) pointRecord.lifetimePointsEarned += points;
    if (points < 0) pointRecord.lifetimePointsRedeemed += Math.abs(points);
    await this.points.save(pointRecord);

    return this.transactions.save(
      this.transactions.create({
        tenantId: options.tenantId,
        customerId: savedCustomer.id,
        points,
        pointsEarned: points > 0 ? points : 0,
        pointsRedeemed: points < 0 ? Math.abs(points) : 0,
        source: options.source,
        type: options.type,
        orderId: options.orderId,
        balanceAfter: savedCustomer.pointsBalance,
        reason: options.reason ?? null,
        externalRef: options.externalRef ?? null,
        metadata: options.metadata ?? {},
      }),
    );
  }

  private async ensurePointsRecord(customer: CustomerEntity): Promise<LoyaltyPointsEntity> {
    const existing = await this.points.findOne({ where: { tenantId: customer.tenantId, customerId: customer.id } });
    if (existing) {
      if (existing.pointsBalance !== customer.pointsBalance) {
        existing.pointsBalance = customer.pointsBalance;
        await this.points.save(existing);
      }
      return existing;
    }
    return this.points.save(
      this.points.create({
        tenantId: customer.tenantId,
        customerId: customer.id,
        pointsBalance: customer.pointsBalance,
        currentTierName: 'Member',
      }),
    );
  }

  private async ensureDefaultTiers(tenantId: string): Promise<void> {
    const count = await this.tiers.count({ where: { tenantId } });
    if (count > 0) return;
    await this.tiers.save([
      this.tiers.create({ tenantId, name: 'Silver', pointsThreshold: 500, spendThreshold: '100.00', pointsMultiplier: '1.0000', discountPercent: '0.00', perks: ['Birthday reward'], sortOrder: 10 }),
      this.tiers.create({ tenantId, name: 'Gold', pointsThreshold: 2000, spendThreshold: '500.00', pointsMultiplier: '1.2500', discountPercent: '5.00', perks: ['Priority rewards', 'Exclusive offers'], sortOrder: 20 }),
      this.tiers.create({ tenantId, name: 'Platinum', pointsThreshold: 5000, spendThreshold: '1000.00', pointsMultiplier: '1.5000', discountPercent: '10.00', perks: ['VIP rewards', 'Free-item perks'], sortOrder: 30 }),
    ]);
  }

  private async resolveTier(customer: CustomerEntity): Promise<LoyaltyTierEntity | null> {
    const tiers = await this.tiers.find({
      where: { tenantId: customer.tenantId, isActive: true },
      order: { pointsThreshold: 'ASC', spendThreshold: 'ASC' },
    });
    const spend = parseMoney(customer.lifetimeValue);
    return tiers
      .filter((tier) => customer.pointsBalance >= tier.pointsThreshold || spend >= parseMoney(tier.spendThreshold))
      .sort((a, b) => b.pointsThreshold - a.pointsThreshold || parseMoney(b.spendThreshold) - parseMoney(a.spendThreshold))[0] ?? null;
  }

  private async updateTier(customer: CustomerEntity): Promise<LoyaltyTierEntity | null> {
    const tier = await this.resolveTier(customer);
    const pointRecord = await this.ensurePointsRecord(customer);
    pointRecord.currentTierId = tier?.id ?? null;
    pointRecord.currentTierName = tier?.name ?? 'Member';
    await this.points.save(pointRecord);
    const tierSegments = new Set((customer.segments ?? []).filter((segment) => !segment.startsWith('Loyalty: ')));
    if (tier) tierSegments.add(`Loyalty: ${tier.name}`);
    customer.segments = [...tierSegments].sort();
    await this.customers.save(customer);
    return tier;
  }

  private async getReferralSummary(tenant: TenantContext, customerId: string) {
    const referrals = await this.referrals.find({
      where: { tenantId: tenant.tenantId, referrerCustomerId: customerId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    let code = referrals[0]?.code;
    if (!code) {
      const customer = await this.customers.findOne({ where: { tenantId: tenant.tenantId, id: customerId } });
      if (customer) {
        const referral = await this.createReferral(tenant, { referrerCustomerId: customerId });
        code = referral.code;
        referrals.unshift(referral);
      }
    }
    return {
      code,
      referralLink: code ? `/signup?ref=${code}` : null,
      totalReferrals: referrals.length,
      rewardedReferrals: referrals.filter((referral) => referral.status === 'rewarded').length,
      referrals,
    };
  }

  private async rewardReferral(tenant: TenantContext, referral: LoyaltyReferralEntity): Promise<LoyaltyReferralEntity> {
    if (!referral.referredCustomerId || referral.rewardedAt) return referral;
    const [referrer, referee] = await Promise.all([
      this.customers.findOne({ where: { tenantId: tenant.tenantId, id: referral.referrerCustomerId } }),
      this.customers.findOne({ where: { tenantId: tenant.tenantId, id: referral.referredCustomerId } }),
    ]);
    if (!referrer || !referee) return referral;
    await this.applyPointChange(referrer, referral.referrerBonusPoints, {
      tenantId: tenant.tenantId,
      type: LoyaltyTransactionType.REFERRAL,
      source: 'referral',
      orderId: null,
      reason: 'Referral bonus',
      externalRef: referral.id,
    });
    if (referral.refereeBonusPoints > 0) {
      await this.applyPointChange(referee, referral.refereeBonusPoints, {
        tenantId: tenant.tenantId,
        type: LoyaltyTransactionType.REFERRAL,
        source: 'referral',
        orderId: null,
        reason: 'Referral signup bonus',
        externalRef: referral.id,
      });
    }
    referral.status = 'rewarded';
    referral.rewardedAt = new Date();
    return this.referrals.save(referral);
  }

  private async checkRedemptionFraud(
    tenantId: string,
    customerId: string,
    settings: LoyaltySettingsEntity,
  ): Promise<string | null> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const redemptions = await this.transactions.count({
      where: {
        tenantId,
        customerId,
        type: LoyaltyTransactionType.REDEEM,
        createdAt: MoreThanOrEqual(since),
      },
    });
    return redemptions >= settings.maxDailyRedemptions ? 'Daily redemption limit reached' : null;
  }

  private async checkReferralFraud(
    tenantId: string,
    referrerCustomerId: string,
    settings: LoyaltySettingsEntity,
  ): Promise<string | null> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const referrals = await this.referrals.count({
      where: { tenantId, referrerCustomerId, createdAt: MoreThanOrEqual(since) },
    });
    return referrals >= settings.maxDailyReferrals ? 'Daily referral limit reached' : null;
  }

  private generateReferralCode(customer: CustomerEntity): string {
    return `${customer.name.replace(/[^a-z0-9]/gi, '').slice(0, 4) || 'ORD'}${customer.id.slice(0, 6)}`.toUpperCase();
  }

  private normalizeCurrency(currency?: string | null): string | null {
    return currency?.trim().toUpperCase().slice(0, 3) || null;
  }

  private resolveCurrency(tenant: TenantContext, currency?: string | null): string {
    return this.normalizeCurrency(currency) ?? tenant.settings?.currency ?? 'EUR';
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

  private async notifyTierUpgrade(customer: CustomerEntity, tierName: string): Promise<void> {
    const recipient = customer.email ?? customer.phone;
    if (!recipient) return;
    await this.notifications.createAndSend(customer.tenantId, {
      type: NotificationType.CUSTOMER,
      channel: customer.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
      recipient,
      payload: {
        title: 'You reached a new loyalty tier',
        message: `You are now ${tierName}.`,
        tierName,
        category: 'loyalty',
      },
    });
  }
}
