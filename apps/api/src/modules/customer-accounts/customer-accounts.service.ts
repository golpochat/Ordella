import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../common/interfaces';
import { ProductEntity } from '../catalog/entities/product.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { GiftCardEntity, StoreCreditTransactionEntity } from '../giftcards/entities';
import { CustomerEntity, LoyaltyTransactionEntity } from '../loyalty/entities';
import { hashPassword, verifyPassword } from '../onboarding/utils/password.util';
import { NotificationChannelType } from '../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/services/notifications.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import {
  CreateCustomerAddressDto,
  LoginCustomerDto,
  RegisterCustomerDto,
  ResetCustomerPasswordDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
} from './dto';
import { CustomerAddressEntity } from './entities';

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
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
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
    await this.notifyCustomer(saved, 'Account created', 'Your customer account has been created.');
    return this.issueTokens(saved);
  }

  async login(tenant: TenantContext, dto: LoginCustomerDto) {
    const customer = await this.customers.findOne({
      where: { tenantId: tenant.tenantId, email: this.normalizeEmail(dto.email) },
    });
    if (!customer?.passwordHash || !(await verifyPassword(dto.password, customer.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    customer.lastLoginAt = new Date();
    await this.customers.save(customer);
    return this.issueTokens(customer);
  }

  async requestPasswordReset(tenant: TenantContext, dto: ResetCustomerPasswordDto): Promise<void> {
    const customer = await this.customers.findOne({
      where: { tenantId: tenant.tenantId, email: this.normalizeEmail(dto.email) },
    });
    if (!customer) return;
    await this.notifyCustomer(
      customer,
      'Password reset requested',
      'A password reset was requested for your customer account.',
    );
  }

  async getAccount(tenant: TenantContext, customerId: string) {
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    const [addresses, loyaltyHistory, storeCreditHistory, giftCards, recentOrders] =
      await Promise.all([
        this.listAddresses(tenant, customerId),
        this.listLoyaltyHistory(tenant, customerId),
        this.listStoreCreditHistory(tenant, customerId),
        this.listGiftCards(tenant, customerId),
        this.listOrders(tenant, customerId),
      ]);
    return {
      ...this.toProfile(customer),
      addresses,
      loyaltyHistory,
      storeCreditHistory,
      giftCards,
      recentOrders: recentOrders.slice(0, 5),
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
    if (dto.marketingEmailOptIn !== undefined) customer.marketingEmailOptIn = dto.marketingEmailOptIn;
    if (dto.marketingSmsOptIn !== undefined) customer.marketingSmsOptIn = dto.marketingSmsOptIn;
    if (dto.notificationPreferences?.marketingEmail !== undefined) {
      customer.marketingEmailOptIn = dto.notificationPreferences.marketingEmail;
    }
    if (dto.notificationPreferences?.marketingSms !== undefined) {
      customer.marketingSmsOptIn = dto.notificationPreferences.marketingSms;
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
    const address = this.addresses.create({
      customerId,
      label: dto.label.trim(),
      line1: dto.addressLine1.trim(),
      line2: dto.addressLine2?.trim() || null,
      city: dto.city.trim(),
      postcode: dto.postalCode?.trim() || null,
      country: dto.country?.trim() || 'GB',
      instructions: dto.instructions?.trim() || null,
      isDefault: Boolean(dto.isDefault) || addressCount === 0,
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
    if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;
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

  private async issueTokens(customer: CustomerEntity) {
    const accessToken = await this.jwtService.signAsync({
      sub: customer.id,
      tenantId: customer.tenantId,
      email: customer.email,
      type: 'customer',
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: customer.id,
        tenantId: customer.tenantId,
        type: 'customer',
      },
      { expiresIn: this.config.get<string>('CUSTOMER_JWT_REFRESH_EXPIRES_IN', '30d') },
    );
    return {
      accessToken,
      refreshToken,
      customerId: customer.id,
      name: customer.name,
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
      notificationPreferences: {
        email: Boolean(customer.email),
        sms: Boolean(customer.phone),
        push: true,
        marketingEmail: customer.marketingEmailOptIn,
        marketingSms: customer.marketingSmsOptIn,
      },
      marketingEmailOptIn: customer.marketingEmailOptIn,
      marketingSmsOptIn: customer.marketingSmsOptIn,
    };
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
