import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { In, IsNull, MoreThan, Repository } from 'typeorm';
import { TenantContext } from '../../common/interfaces';
import { ProductEntity } from '../catalog/entities/product.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { GiftCardEntity, StoreCreditTransactionEntity } from '../giftcards/entities';
import { CustomerEntity, LoyaltyTransactionEntity } from '../loyalty/entities';
import { LoyaltyService } from '../loyalty/services';
import { hashPassword, verifyPassword } from '../onboarding/utils/password.util';
import { NotificationChannelType } from '../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/services/notifications.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { SubscriptionEntity, SubscriptionStatus } from '../subscriptions/entities';
import { SupportTicketEntity, SupportTicketMessageEntity } from '../support/entities';
import {
  CreateCustomerAddressDto,
  CompleteCustomerPasswordResetDto,
  LoginCustomerDto,
  RegisterCustomerDto,
  ResetCustomerPasswordDto,
  SaveCustomerBasketDto,
  SaveCustomerItemDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
  UpdateCustomerSavedBasketDto,
  VerifyCustomerEmailDto,
} from './dto';
import {
  CustomerAddressEntity,
  CustomerSavedBasketEntity,
  CustomerSavedItemEntity,
  CustomerSecurityTokenEntity,
  CustomerSecurityTokenType,
  CustomerSessionEntity,
} from './entities';

type CustomerOrderFilter = 'active' | 'past';

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

@Injectable()
export class CustomerAccountsService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(CustomerAddressEntity)
    private readonly addresses: Repository<CustomerAddressEntity>,
    @InjectRepository(CustomerSavedBasketEntity)
    private readonly savedBaskets: Repository<CustomerSavedBasketEntity>,
    @InjectRepository(CustomerSavedItemEntity)
    private readonly savedItems: Repository<CustomerSavedItemEntity>,
    @InjectRepository(CustomerSessionEntity)
    private readonly sessions: Repository<CustomerSessionEntity>,
    @InjectRepository(CustomerSecurityTokenEntity)
    private readonly securityTokens: Repository<CustomerSecurityTokenEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly loyaltyTransactions: Repository<LoyaltyTransactionEntity>,
    @InjectRepository(GiftCardEntity)
    private readonly giftCards: Repository<GiftCardEntity>,
    @InjectRepository(StoreCreditTransactionEntity)
    private readonly storeCreditTransactions: Repository<StoreCreditTransactionEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variants: Repository<VariantEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
    @InjectRepository(SupportTicketEntity)
    private readonly supportTickets: Repository<SupportTicketEntity>,
    @InjectRepository(SupportTicketMessageEntity)
    private readonly supportMessages: Repository<SupportTicketMessageEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly loyalty: LoyaltyService,
  ) {}

  async register(tenant: TenantContext, dto: RegisterCustomerDto) {
    const email = this.normalizeEmail(dto.email);
    const phone = this.normalizePhone(dto.phone);
    const existing = await this.customers.findOne({ where: { tenantId: tenant.tenantId, email } });
    if (existing?.passwordHash) {
      throw new BadRequestException('Customer account already exists');
    }

    const customer =
      existing ??
      this.customers.create({
        tenantId: tenant.tenantId,
        name: dto.name.trim(),
        email,
        phone,
      });
    customer.name = dto.name.trim();
    customer.email = email;
    customer.phone = phone;
    customer.passwordHash = await hashPassword(dto.password);
    customer.lastLoginAt = new Date();
    const saved = await this.customers.save(customer);
    const session = await this.createSession(saved);
    await this.notifyCustomer(saved, 'Account created', 'Your customer account has been created.');
    await this.requestEmailVerification(tenant, saved.id);
    return this.issueTokens(saved, session);
  }

  async login(tenant: TenantContext, dto: LoginCustomerDto) {
    const customer = await this.customers.findOne({
      where: { tenantId: tenant.tenantId, email: this.normalizeEmail(dto.email) },
    });
    if (!customer?.passwordHash || !(await verifyPassword(dto.password, customer.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    customer.lastLoginAt = new Date();
    const saved = await this.customers.save(customer);
    const session = await this.createSession(saved);
    return this.issueTokens(saved, session);
  }

  async requestPasswordReset(tenant: TenantContext, dto: ResetCustomerPasswordDto): Promise<void> {
    const customer = await this.customers.findOne({
      where: { tenantId: tenant.tenantId, email: this.normalizeEmail(dto.email) },
    });
    if (!customer) return;
    await this.notifyCustomer(
      customer,
      'Password reset requested',
      `Use this password reset token to finish resetting your account: ${await this.createSecurityToken(
        tenant.tenantId,
        customer.id,
        'password_reset',
        60 * 60 * 1000,
      )}`,
    );
  }

  async resetPassword(tenant: TenantContext, dto: CompleteCustomerPasswordResetDto) {
    const token = await this.consumeSecurityToken(tenant.tenantId, dto.token, 'password_reset');
    const customer = await this.requireCustomer(tenant.tenantId, token.customerId);
    customer.passwordHash = await hashPassword(dto.password);
    await this.sessions.update({ tenantId: tenant.tenantId, customerId: customer.id }, { revokedAt: new Date() });
    await this.customers.save(customer);
    return { reset: true };
  }

  async requestEmailVerification(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    if (!customer.email || customer.emailVerifiedAt) return { sent: false, verified: Boolean(customer.emailVerifiedAt) };
    const token = await this.createSecurityToken(tenant.tenantId, customer.id, 'email_verification', 24 * 60 * 60 * 1000);
    await this.notifyCustomer(
      customer,
      'Verify your email',
      `Use this email verification token to confirm your customer account: ${token}`,
    );
    return { sent: true, verified: false };
  }

  async verifyEmail(tenant: TenantContext, dto: VerifyCustomerEmailDto) {
    const token = await this.consumeSecurityToken(tenant.tenantId, dto.token, 'email_verification');
    const customer = await this.requireCustomer(tenant.tenantId, token.customerId);
    customer.emailVerifiedAt = new Date();
    return this.toProfile(await this.customers.save(customer));
  }

  async getAccount(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const [
      addresses,
      loyaltyHistory,
      storeCreditHistory,
      giftCards,
      recentOrders,
      savedBaskets,
      savedItems,
      sessions,
      rewards,
    ] =
      await Promise.all([
        this.listAddresses(tenant, customerId),
        this.listLoyaltyHistory(tenant, customerId),
        this.listStoreCreditHistory(tenant, customerId),
        this.listGiftCards(tenant, customerId),
        this.listOrders(tenant, customerId),
        this.listSavedBaskets(tenant, customerId),
        this.listSavedItems(tenant, customerId),
        this.listSessions(tenant, customerId),
        this.loyalty.getCustomerRewardsOverview(tenant, customerId),
      ]);
    return {
      ...this.toProfile(customer),
      addresses,
      loyaltyHistory,
      storeCreditHistory,
      giftCards,
      recentOrders: recentOrders.slice(0, 5),
      savedBaskets,
      savedItems,
      sessions,
      availableRewards: rewards.rewards,
      referral: rewards.referral,
      loyaltyPointsSummary: rewards.points,
      loyaltyTierDetail: rewards.tier,
      tenantSettings: tenant.settings ?? null,
      locale: tenant.settings?.locale,
      currency: tenant.settings?.currency,
      timezone: tenant.settings?.timezone,
    };
  }

  async updateProfile(tenant: TenantContext, customerId: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    if (dto.email) {
      const email = this.normalizeEmail(dto.email);
      const existing = await this.customers.findOne({ where: { tenantId: tenant.tenantId, email } });
      if (existing && existing.id !== customer.id) {
        throw new BadRequestException('Email is already used by another customer');
      }
      customer.email = email;
    }
    if (dto.name !== undefined) customer.name = dto.name.trim();
    if (dto.phone !== undefined) customer.phone = this.normalizePhone(dto.phone);
    if (dto.dateOfBirth !== undefined) customer.dateOfBirth = dto.dateOfBirth ? dto.dateOfBirth.slice(0, 10) : null;
    if (dto.gender !== undefined) customer.gender = dto.gender.trim() || null;
    if (dto.preferences !== undefined) customer.preferences = dto.preferences ?? {};
    if (dto.notificationPreferences?.email !== undefined) {
      customer.notificationEmailOptIn = dto.notificationPreferences.email;
    }
    if (dto.notificationPreferences?.sms !== undefined) {
      customer.notificationSmsOptIn = dto.notificationPreferences.sms;
    }
    if (dto.notificationPreferences?.push !== undefined) {
      customer.notificationPushOptIn = dto.notificationPreferences.push;
    }
    if (dto.marketingEmailOptIn !== undefined) customer.marketingEmailOptIn = dto.marketingEmailOptIn;
    if (dto.marketingSmsOptIn !== undefined) customer.marketingSmsOptIn = dto.marketingSmsOptIn;
    if (dto.marketingPushOptIn !== undefined) customer.marketingPushOptIn = dto.marketingPushOptIn;
    if (dto.notificationPreferences?.marketingEmail !== undefined) {
      customer.marketingEmailOptIn = dto.notificationPreferences.marketingEmail;
    }
    if (dto.notificationPreferences?.marketingSms !== undefined) {
      customer.marketingSmsOptIn = dto.notificationPreferences.marketingSms;
    }
    if (dto.notificationPreferences?.marketingPush !== undefined) {
      customer.marketingPushOptIn = dto.notificationPreferences.marketingPush;
    }
    return this.toProfile(await this.customers.save(customer));
  }

  async listAddresses(_tenant: TenantContext, customerId: string) {
    const rows = await this.addresses.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
    return rows.map((address) => this.toAddress(address));
  }

  async createAddress(tenant: TenantContext, customerId: string, dto: CreateCustomerAddressDto) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const addressCount = await this.addresses.count({ where: { customerId } });
    const isDefault = Boolean(dto.isDefault) || addressCount === 0;
    if (isDefault) {
      await this.addresses.update({ customerId }, { isDefault: false });
    }
    const address = this.addresses.create({
      customerId,
      label: dto.label.trim(),
      line1: dto.addressLine1.trim(),
      line2: dto.addressLine2?.trim() || null,
      city: dto.city.trim(),
      postcode: dto.postalCode?.trim() || null,
      country: dto.country?.trim() || 'GB',
      instructions: dto.instructions?.trim() || null,
      isDefault,
    });
    const saved = await this.addresses.save(address);
    if (saved.isDefault) {
      await this.markDefaultAddress(tenant.tenantId, customerId, saved.id);
    }
    return this.toAddress(saved);
  }

  async updateAddress(
    tenant: TenantContext,
    customerId: string,
    addressId: string,
    dto: UpdateCustomerAddressDto,
  ) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const address = await this.requireAddress(customerId, addressId);
    if (dto.label !== undefined) address.label = dto.label.trim();
    if (dto.addressLine1 !== undefined) address.line1 = dto.addressLine1.trim();
    if (dto.addressLine2 !== undefined) address.line2 = dto.addressLine2.trim() || null;
    if (dto.city !== undefined) address.city = dto.city.trim();
    if (dto.postalCode !== undefined) address.postcode = dto.postalCode.trim() || null;
    if (dto.country !== undefined) address.country = dto.country.trim() || 'GB';
    if (dto.instructions !== undefined) address.instructions = dto.instructions.trim() || null;
    if (dto.isDefault) {
      await this.addresses.update({ customerId }, { isDefault: false });
      address.isDefault = true;
    } else if (dto.isDefault !== undefined) {
      address.isDefault = false;
    }
    const saved = await this.addresses.save(address);
    if (saved.isDefault) {
      await this.markDefaultAddress(tenant.tenantId, customerId, saved.id);
    } else if (customer.defaultAddressId === saved.id) {
      await this.customers.update({ id: customerId, tenantId: tenant.tenantId }, { defaultAddressId: null });
    }
    return this.toAddress(saved);
  }

  async deleteAddress(tenant: TenantContext, customerId: string, addressId: string): Promise<void> {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    await this.requireAddress(customerId, addressId);
    await this.addresses.delete({ id: addressId, customerId });
    if (customer.defaultAddressId === addressId) {
      const nextDefault = await this.addresses.findOne({
        where: { customerId },
        order: { createdAt: 'ASC' },
      });
      customer.defaultAddressId = nextDefault?.id ?? null;
      if (nextDefault) nextDefault.isDefault = true;
      await Promise.all([
        this.customers.save(customer),
        nextDefault ? this.addresses.save(nextDefault) : Promise.resolve(),
      ]);
    }
  }

  async listOrders(tenant: TenantContext, customerId: string, filter?: CustomerOrderFilter) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const status =
      filter === 'active'
        ? In(ACTIVE_ORDER_STATUSES)
        : filter === 'past'
          ? In(Object.values(OrderStatus).filter((value) => !ACTIVE_ORDER_STATUSES.includes(value)))
          : undefined;
    const orders = await this.orders.find({
      where: { tenantId: tenant.tenantId, customerId, ...(status ? { status } : {}) },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return orders.map((order) => this.toOrderSummary(order));
  }

  async getOrder(tenant: TenantContext, customerId: string, orderId: string) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const order = await this.orders.findOne({
      where: { tenantId: tenant.tenantId, customerId, id: orderId },
      relations: { items: true, statusHistory: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.toOrderDetail(order);
  }

  async listLoyaltyHistory(tenant: TenantContext, customerId: string) {
    return this.loyaltyTransactions.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async listStoreCreditHistory(tenant: TenantContext, customerId: string) {
    return this.storeCreditTransactions.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async listGiftCards(tenant: TenantContext, customerId: string) {
    return this.giftCards.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async linkGiftCard(tenant: TenantContext, customerId: string, code: string) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const giftCard = await this.giftCards.findOne({
      where: { tenantId: tenant.tenantId, code: code.trim().toUpperCase().replace(/\s+/g, '') },
    });
    if (!giftCard) throw new NotFoundException('Gift card not found');
    if (giftCard.customerId && giftCard.customerId !== customerId) {
      throw new BadRequestException('Gift card is linked to another customer');
    }
    giftCard.customerId = customerId;
    return this.giftCards.save(giftCard);
  }

  async listSavedBaskets(tenant: TenantContext, customerId: string) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const rows = await this.savedBaskets.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
      take: 50,
    });
    return rows.map((basket) => this.toSavedBasket(basket));
  }

  async saveBasket(tenant: TenantContext, customerId: string, dto: SaveCustomerBasketDto) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const saved = await this.savedBaskets.save(
      this.savedBaskets.create({
        tenantId: tenant.tenantId,
        customerId,
        name: dto.name.trim() || 'Saved basket',
        items: dto.items,
        itemCount: this.countBasketItems(dto.items),
        subtotal: this.formatDecimal(dto.subtotal),
        currency: this.resolveCurrency(tenant, dto.currency),
      }),
    );
    return this.toSavedBasket(saved);
  }

  async updateSavedBasket(
    tenant: TenantContext,
    customerId: string,
    basketId: string,
    dto: UpdateCustomerSavedBasketDto,
  ) {
    const basket = await this.requireSavedBasket(tenant.tenantId, customerId, basketId);
    if (dto.name !== undefined) basket.name = dto.name.trim() || 'Saved basket';
    if (dto.items !== undefined) {
      basket.items = dto.items;
      basket.itemCount = this.countBasketItems(dto.items);
    }
    if (dto.subtotal !== undefined) basket.subtotal = this.formatDecimal(dto.subtotal);
    if (dto.currency !== undefined) basket.currency = this.resolveCurrency(tenant, dto.currency);
    return this.toSavedBasket(await this.savedBaskets.save(basket));
  }

  async deleteSavedBasket(tenant: TenantContext, customerId: string, basketId: string): Promise<void> {
    await this.requireSavedBasket(tenant.tenantId, customerId, basketId);
    await this.savedBaskets.delete({ tenantId: tenant.tenantId, customerId, id: basketId });
  }

  async listSavedItems(tenant: TenantContext, customerId: string) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const rows = await this.savedItems.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
      take: 100,
    });
    return rows.map((item) => this.toSavedItem(item));
  }

  async saveItem(tenant: TenantContext, customerId: string, dto: SaveCustomerItemDto) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const existing = await this.savedItems.findOne({
      where: {
        tenantId: tenant.tenantId,
        customerId,
        productId: dto.productId,
        variantId: dto.variantId ?? IsNull(),
      },
    });
    const saved = await this.savedItems.save(
      this.savedItems.create({
        ...(existing ?? {}),
        tenantId: tenant.tenantId,
        customerId,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
        quantity: Math.max(1, Math.floor(dto.quantity ?? 1)),
        label: dto.label?.trim() || null,
        metadata: dto.metadata ?? {},
      }),
    );
    return this.toSavedItem(saved);
  }

  async deleteSavedItem(tenant: TenantContext, customerId: string, itemId: string): Promise<void> {
    await this.savedItems.delete({ tenantId: tenant.tenantId, customerId, id: itemId });
  }

  async listSessions(tenant: TenantContext, customerId: string) {
    await this.requireCustomer(tenant.tenantId, customerId);
    const rows = await this.sessions.find({
      where: { tenantId: tenant.tenantId, customerId },
      order: { lastSeenAt: 'DESC' },
      take: 20,
    });
    return rows.map((session) => ({
      id: session.id,
      deviceLabel: session.deviceLabel,
      lastSeenAt: session.lastSeenAt,
      revokedAt: session.revokedAt,
      isActive: !session.revokedAt,
    }));
  }

  async revokeSession(tenant: TenantContext, customerId: string, sessionId: string): Promise<void> {
    const session = await this.sessions.findOne({ where: { tenantId: tenant.tenantId, customerId, id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    session.revokedAt = new Date();
    await this.sessions.save(session);
  }

  async exportMyData(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const [addresses, orders, loyaltyHistory, storeCreditHistory, giftCards, savedBaskets, savedItems, sessions, subscriptions, supportTickets] =
      await Promise.all([
        this.listAddresses(tenant, customerId),
        this.listOrders(tenant, customerId),
        this.listLoyaltyHistory(tenant, customerId),
        this.listStoreCreditHistory(tenant, customerId),
        this.listGiftCards(tenant, customerId),
        this.listSavedBaskets(tenant, customerId),
        this.listSavedItems(tenant, customerId),
        this.listSessions(tenant, customerId),
        this.subscriptions.find({
          where: { tenantId: tenant.tenantId, customerId },
          relations: { plan: true, items: true, orders: true },
          order: { createdAt: 'DESC' },
        }),
        this.supportTickets.find({
          where: { tenantId: tenant.tenantId, customerId },
          relations: { messages: true },
          order: { createdAt: 'DESC' },
        }),
      ]);

    return {
      exportedAt: new Date(),
      tenant: {
        tenantId: tenant.tenantId,
        locale: tenant.settings?.locale,
        currency: tenant.settings?.currency,
        timezone: tenant.settings?.timezone,
      },
      profile: this.toProfile(customer),
      addresses,
      orders,
      loyaltyHistory,
      storeCreditHistory,
      giftCards,
      savedBaskets,
      savedItems,
      sessions,
      subscriptions,
      supportTickets,
    };
  }

  async deleteMyData(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const erasedAt = new Date();
    customer.name = 'Deleted customer';
    customer.email = null;
    customer.phone = null;
    customer.passwordHash = null;
    customer.defaultAddressId = null;
    customer.dateOfBirth = null;
    customer.gender = null;
    customer.preferences = {};
    customer.tags = [];
    customer.segments = [];
    customer.staffNotes = null;
    customer.notificationEmailOptIn = false;
    customer.notificationSmsOptIn = false;
    customer.notificationPushOptIn = false;
    customer.marketingEmailOptIn = false;
    customer.marketingSmsOptIn = false;
    customer.marketingPushOptIn = false;
    customer.gdprErasedAt = erasedAt;
    await Promise.all([
      this.addresses.delete({ customerId }),
      this.savedBaskets.delete({ tenantId: tenant.tenantId, customerId }),
      this.savedItems.delete({ tenantId: tenant.tenantId, customerId }),
      this.sessions.update({ tenantId: tenant.tenantId, customerId }, { revokedAt: erasedAt }),
      this.securityTokens.update({ tenantId: tenant.tenantId, customerId }, { consumedAt: erasedAt }),
      this.subscriptions.update(
        { tenantId: tenant.tenantId, customerId },
        { status: SubscriptionStatus.CANCELLED, canceledAt: erasedAt, cancelAtPeriodEnd: true },
      ),
      this.supportMessages.update(
        { tenantId: tenant.tenantId, authorCustomerId: customerId },
        { body: '[deleted customer message]', attachments: [] },
      ),
      this.supportTickets.update(
        { tenantId: tenant.tenantId, customerId },
        { subject: 'Deleted customer support ticket', description: null, attachments: [], metadata: {} },
      ),
      this.customers.save(customer),
    ]);
    return { deleted: true, erasedAt };
  }

  private async issueTokens(customer: CustomerEntity, session?: CustomerSessionEntity) {
    const accessToken = await this.jwtService.signAsync({
      sub: customer.id,
      tenantId: customer.tenantId,
      email: customer.email,
      type: 'customer',
      sessionId: session?.id,
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: customer.id,
        tenantId: customer.tenantId,
        type: 'customer',
        sessionId: session?.id,
      },
      { expiresIn: this.config.get<string>('CUSTOMER_JWT_REFRESH_EXPIRES_IN', '30d') },
    );
    return {
      accessToken,
      refreshToken,
      customerId: customer.id,
      name: customer.name,
      sessionId: session?.id,
    };
  }

  private async requireCustomer(tenantId: string, customerId: string): Promise<CustomerEntity> {
    const customer = await this.customers.findOne({ where: { id: customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private async requireAddress(customerId: string, addressId: string): Promise<CustomerAddressEntity> {
    const address = await this.addresses.findOne({ where: { id: addressId, customerId } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  private async requireSavedBasket(
    tenantId: string,
    customerId: string,
    basketId: string,
  ): Promise<CustomerSavedBasketEntity> {
    const basket = await this.savedBaskets.findOne({ where: { id: basketId, tenantId, customerId } });
    if (!basket) throw new NotFoundException('Saved basket not found');
    return basket;
  }

  private async markDefaultAddress(
    tenantId: string,
    customerId: string,
    addressId: string,
  ): Promise<void> {
    await this.addresses.update({ customerId }, { isDefault: false });
    await this.addresses.update({ id: addressId, customerId }, { isDefault: true });
    await this.customers.update({ id: customerId, tenantId }, { defaultAddressId: addressId });
  }

  private toProfile(customer: CustomerEntity) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      dateOfBirth: customer.dateOfBirth,
      gender: customer.gender,
      preferences: customer.preferences ?? {},
      emailVerifiedAt: customer.emailVerifiedAt,
      loyaltyPoints: customer.pointsBalance,
      pointsBalance: customer.pointsBalance,
      storeCreditBalance: customer.storeCreditBalance,
      defaultAddressId: customer.defaultAddressId,
      createdAt: customer.createdAt,
      lastLoginAt: customer.lastLoginAt,
      lastOrderAt: customer.lastOrderAt,
      lifetimeValue: customer.lifetimeValue,
      totalOrders: customer.totalOrders,
      avgOrderValue: customer.avgOrderValue,
      firstOrderAt: customer.firstOrderAt,
      preferredLocationId: customer.preferredLocationId,
      segments: customer.segments,
      orderFrequency: this.orderFrequency(customer.firstOrderAt, customer.lastOrderAt, customer.totalOrders),
      loyaltyTier: this.loyaltyTier(customer.pointsBalance, Number(customer.lifetimeValue)),
      notificationPreferences: {
        email: customer.notificationEmailOptIn,
        sms: customer.notificationSmsOptIn,
        push: customer.notificationPushOptIn,
        marketingEmail: customer.marketingEmailOptIn,
        marketingSms: customer.marketingSmsOptIn,
        marketingPush: customer.marketingPushOptIn,
      },
      marketingEmailOptIn: customer.marketingEmailOptIn,
      marketingSmsOptIn: customer.marketingSmsOptIn,
      marketingPushOptIn: customer.marketingPushOptIn,
      gdprErasedAt: customer.gdprErasedAt,
    };
  }

  private loyaltyTier(pointsBalance: number, lifetimeValue: number): string {
    if (pointsBalance >= 5000 || lifetimeValue >= 1000) return 'Platinum';
    if (pointsBalance >= 2000 || lifetimeValue >= 500) return 'Gold';
    if (pointsBalance >= 500 || lifetimeValue >= 100) return 'Silver';
    return 'Member';
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

  private toAddress(address: CustomerAddressEntity) {
    return {
      id: address.id,
      customerId: address.customerId,
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      postcode: address.postcode,
      postalCode: address.postcode ?? undefined,
      country: address.country,
      instructions: address.instructions ?? undefined,
      addressLine1: address.line1,
      addressLine2: address.line2 ?? undefined,
      isDefault: address.isDefault,
    };
  }

  private toSavedBasket(basket: CustomerSavedBasketEntity) {
    return {
      id: basket.id,
      customerId: basket.customerId,
      name: basket.name,
      items: basket.items,
      itemCount: basket.itemCount,
      subtotal: basket.subtotal,
      currency: basket.currency,
      createdAt: basket.createdAt,
      updatedAt: basket.updatedAt,
    };
  }

  private toSavedItem(item: CustomerSavedItemEntity) {
    return {
      id: item.id,
      customerId: item.customerId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      label: item.label,
      metadata: item.metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toOrderSummary(order: OrderEntity) {
    return {
      id: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderType: order.orderType,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
    };
  }

  private async toOrderDetail(order: OrderEntity) {
    const productIds = [...new Set((order.items ?? []).map((item) => item.productId))];
    const variantIds = [
      ...new Set((order.items ?? []).map((item) => item.variantId).filter((id): id is string => Boolean(id))),
    ];
    const [products, variants] = await Promise.all([
      productIds.length ? this.products.find({ where: { id: In(productIds), tenantId: order.tenantId } }) : [],
      variantIds.length ? this.variants.find({ where: { id: In(variantIds) } }) : [],
    ]);
    const productNames = new Map(products.map((product) => [product.id, product.name]));
    const variantNames = new Map(variants.map((variant) => [variant.id, variant.name]));

    return {
      ...this.toOrderSummary(order),
      subtotal: order.subtotal,
      tax: order.tax,
      delivery: order.deliveryDetails
        ? {
            addressLine1: order.deliveryDetails.addressLine1,
            addressLine2: order.deliveryDetails.addressLine2 ?? undefined,
            city: order.deliveryDetails.city,
            postalCode: order.deliveryDetails.postalCode ?? undefined,
            instructions: order.deliveryDetails.instructions ?? undefined,
          }
        : undefined,
      items: (order.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: productNames.get(item.productId) ?? 'Item',
        variantName: item.variantId ? variantNames.get(item.variantId) ?? null : null,
        quantity: item.quantity,
        price: item.price,
        modifiers: [],
        notes: item.notes,
      })),
      statusTimeline: (order.statusHistory ?? [])
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((history) => ({
          status: history.toStatus,
          changedAt: history.createdAt,
          reason: history.reason,
        })),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizePhone(phone?: string | null): string | null {
    return phone?.trim() || null;
  }

  private async createSession(customer: CustomerEntity): Promise<CustomerSessionEntity> {
    return this.sessions.save(
      this.sessions.create({
        tenantId: customer.tenantId,
        customerId: customer.id,
        deviceLabel: 'Customer app',
        lastSeenAt: new Date(),
      }),
    );
  }

  private async createSecurityToken(
    tenantId: string,
    customerId: string,
    type: CustomerSecurityTokenType,
    ttlMs: number,
  ): Promise<string> {
    const now = new Date();
    await this.securityTokens.update({ tenantId, customerId, type, consumedAt: IsNull() }, { consumedAt: now });
    const token = randomBytes(32).toString('hex');
    await this.securityTokens.save(
      this.securityTokens.create({
        tenantId,
        customerId,
        type,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(now.getTime() + ttlMs),
      }),
    );
    return token;
  }

  private async consumeSecurityToken(
    tenantId: string,
    token: string,
    type: CustomerSecurityTokenType,
  ): Promise<CustomerSecurityTokenEntity> {
    const row = await this.securityTokens.findOne({
      where: {
        tenantId,
        type,
        tokenHash: this.hashToken(token),
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!row) throw new BadRequestException('Invalid or expired token');
    row.consumedAt = new Date();
    return this.securityTokens.save(row);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private countBasketItems(items: Array<Record<string, unknown>>): number {
    return items.reduce((sum, item) => {
      const quantity = item.quantity;
      return sum + (typeof quantity === 'number' && Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1);
    }, 0);
  }

  private formatDecimal(value?: number): string {
    return Number(value ?? 0).toFixed(2);
  }

  private resolveCurrency(tenant: TenantContext, currency?: string): string {
    return (currency ?? tenant.settings?.currency ?? 'EUR').trim().toUpperCase().slice(0, 3);
  }

  private async notifyCustomer(customer: CustomerEntity, title: string, message: string): Promise<void> {
    const recipient = customer.email ?? customer.phone;
    if (!recipient) return;
    await this.notifications.createAndSend(customer.tenantId, {
      type: NotificationType.CUSTOMER,
      channel: customer.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
      recipient,
      payload: { title, message, category: 'customer-account' },
    });
  }
}
