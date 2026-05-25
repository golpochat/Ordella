import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { StripeClientService } from '../../billing/services/stripe-client.service';
import { CustomerEntity } from '../../loyalty/entities';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { CreateOrderDto } from '../../orders/dto';
import { OrderPaymentMethod } from '../../orders/enums/order-payment-method.enum';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { OrdersService } from '../../orders/services';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import {
  SubscriptionEntity,
  SubscriptionItemEntity,
  SubscriptionOrderEntity,
  SubscriptionOrderStatus,
  SubscriptionSchedule,
  SubscriptionStatus,
} from '../entities';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionItemEntity)
    private readonly items: Repository<SubscriptionItemEntity>,
    @InjectRepository(SubscriptionOrderEntity)
    private readonly runs: Repository<SubscriptionOrderEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    private readonly orders: OrdersService,
    private readonly stripeClient: StripeClientService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(tenant: TenantContext, customerId?: string): Promise<SubscriptionEntity[]> {
    return this.subscriptions.find({
      where: { tenantId: tenant.tenantId, ...(customerId ? { customerId } : {}) },
      relations: { customer: true, items: true, orders: true },
      order: { createdAt: 'DESC' },
    });
  }

  async get(tenant: TenantContext, id: string, customerId?: string): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptions.findOne({
      where: { id, tenantId: tenant.tenantId, ...(customerId ? { customerId } : {}) },
      relations: { customer: true, items: true, orders: true },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async create(tenant: TenantContext, dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    const customer = await this.requireCustomer(tenant.tenantId, dto.customerId);
    const subscription = await this.subscriptions.save(this.subscriptions.create({
      tenantId: tenant.tenantId,
      customerId: customer.id,
      locationId: dto.locationId,
      orderType: dto.orderType ?? OrderType.PICKUP,
      schedule: dto.schedule,
      nextRunAt: dto.nextRunAt ? new Date(dto.nextRunAt) : this.nextRunDate(dto.schedule, new Date()),
      status: SubscriptionStatus.ACTIVE,
      totalPrice: dto.totalPrice.toFixed(2),
      paymentMethodId: dto.paymentMethodId ?? null,
      deliveryDetails: dto.deliveryDetails ?? null,
    }));
    await this.replaceItems(subscription.id, dto.items);
    await this.notify(customer, 'Subscription created', 'Your recurring order subscription has been created.');
    return this.get(tenant, subscription.id);
  }

  async createCheckoutSession(tenant: TenantContext, dto: CreateSubscriptionDto): Promise<{ subscription: SubscriptionEntity; sessionId: string; url: string }> {
    const subscription = await this.create(tenant, dto);
    if (!this.stripeClient.isConfigured()) {
      return {
        subscription,
        sessionId: `cs_subscription_placeholder_${subscription.id}`,
        url: `${this.stripeClient.storefrontBaseUrl()}/account?subscription=created`,
      };
    }

    const session = await this.stripeClient.client().checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${this.stripeClient.storefrontBaseUrl()}/account?subscription=created`,
      cancel_url: `${this.stripeClient.storefrontBaseUrl()}/checkout?subscription=cancelled`,
      metadata: {
        type: 'customer_subscription_setup',
        tenantId: tenant.tenantId,
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
      },
    });
    return { subscription, sessionId: session.id, url: session.url ?? `${this.stripeClient.storefrontBaseUrl()}/account` };
  }

  async update(tenant: TenantContext, id: string, dto: UpdateSubscriptionDto, customerId?: string): Promise<SubscriptionEntity> {
    const subscription = await this.get(tenant, id, customerId);
    if (dto.schedule !== undefined) subscription.schedule = dto.schedule;
    if (dto.nextRunAt !== undefined) subscription.nextRunAt = new Date(dto.nextRunAt);
    if (dto.status !== undefined) subscription.status = dto.status;
    if (dto.paymentMethodId !== undefined) subscription.paymentMethodId = dto.paymentMethodId || null;
    if (dto.deliveryDetails !== undefined) subscription.deliveryDetails = dto.deliveryDetails;
    await this.subscriptions.save(subscription);
    if (dto.items) await this.replaceItems(subscription.id, dto.items);
    return this.get(tenant, id, customerId);
  }

  async setStatus(tenant: TenantContext, id: string, status: SubscriptionStatus, customerId?: string): Promise<SubscriptionEntity> {
    const subscription = await this.get(tenant, id, customerId);
    subscription.status = status;
    await this.subscriptions.save(subscription);
    if (subscription.customer) {
      await this.notify(subscription.customer, 'Subscription updated', `Your subscription was ${status}.`);
    }
    return this.get(tenant, id, customerId);
  }

  async analytics(tenant: TenantContext) {
    const rows = await this.subscriptions.find({ where: { tenantId: tenant.tenantId }, relations: { items: true } });
    const active = rows.filter((row) => row.status === SubscriptionStatus.ACTIVE);
    const subscriptionRevenue = rows.reduce((sum, row) => sum + Number(row.totalPrice), 0);
    const recurringRevenueForecast = active.reduce((sum, row) => {
      const multiplier = row.schedule === SubscriptionSchedule.WEEKLY ? 4 : row.schedule === SubscriptionSchedule.BIWEEKLY ? 2 : 1;
      return sum + Number(row.totalPrice) * multiplier;
    }, 0);
    const churnRate = rows.length ? Number(((rows.filter((row) => row.status === SubscriptionStatus.CANCELLED).length / rows.length) * 100).toFixed(2)) : 0;
    return {
      activeSubscriptions: active.length,
      subscriptionRevenue: subscriptionRevenue.toFixed(2),
      recurringRevenueForecast: recurringRevenueForecast.toFixed(2),
      churnRate,
      topSubscriptionProducts: this.topProducts(rows),
    };
  }

  async processDue(now = new Date()): Promise<number> {
    const due = await this.subscriptions.find({
      where: { status: SubscriptionStatus.ACTIVE, nextRunAt: LessThanOrEqual(now) },
      relations: { customer: true, items: true },
      take: 50,
    });
    for (const subscription of due) await this.processRun(subscription);
    return due.length;
  }

  private async processRun(subscription: SubscriptionEntity): Promise<void> {
    try {
      if (this.stripeClient.isConfigured()) {
        if (!subscription.paymentMethodId) throw new BadRequestException('Missing saved payment method');
        await this.stripeClient.client().paymentIntents.create({
          amount: Math.round(Number(subscription.totalPrice) * 100),
          currency: 'eur',
          payment_method: subscription.paymentMethodId,
          confirm: true,
          off_session: true,
          metadata: { subscriptionId: subscription.id, tenantId: subscription.tenantId },
        });
      }
      const order = await this.orders.create(
        { tenantId: subscription.tenantId, source: 'header' },
        this.toCreateOrderDto(subscription),
      );
      await this.orders.update(
        { tenantId: subscription.tenantId, source: 'header' },
        order.id,
        { status: OrderStatus.ACCEPTED },
      );
      await this.runs.save(this.runs.create({
        subscriptionId: subscription.id,
        orderId: order.id,
        runAt: new Date(),
        status: SubscriptionOrderStatus.SUCCESS,
        retryCount: 0,
      }));
      subscription.nextRunAt = this.nextRunDate(subscription.schedule, subscription.nextRunAt);
      await this.subscriptions.save(subscription);
      if (subscription.customer) await this.notify(subscription.customer, 'Subscription order placed', 'Your recurring order has been placed.');
    } catch (error) {
      const lastFailed = await this.runs.findOne({
        where: { subscriptionId: subscription.id, status: SubscriptionOrderStatus.FAILED },
        order: { createdAt: 'DESC' },
      });
      const retryCount = (lastFailed?.retryCount ?? 0) + 1;
      await this.runs.save(this.runs.create({
        subscriptionId: subscription.id,
        orderId: null,
        runAt: new Date(),
        status: SubscriptionOrderStatus.FAILED,
        retryCount,
        failureReason: (error as Error).message,
      }));
      if (retryCount >= 3) {
        subscription.status = SubscriptionStatus.PAYMENT_FAILED;
        await this.subscriptions.save(subscription);
      }
      if (subscription.customer) await this.notify(subscription.customer, 'Subscription issue', 'We could not process your recurring order. Please update your subscription.');
    }
  }

  private toCreateOrderDto(subscription: SubscriptionEntity): CreateOrderDto {
    return {
      customerId: subscription.customerId,
      locationId: subscription.locationId,
      orderType: subscription.orderType,
      paymentMethod: OrderPaymentMethod.CARD,
      deliveryDetails: subscription.orderType === OrderType.DELIVERY
        ? subscription.deliveryDetails as unknown as CreateOrderDto['deliveryDetails']
        : undefined,
      items: subscription.items.map((item) => ({
        productId: item.itemId,
        variantId: item.variantId ?? undefined,
        quantity: item.quantity,
        modifierOptionIds: Array.isArray(item.modifiers?.modifierOptionIds)
          ? item.modifiers.modifierOptionIds as string[]
          : undefined,
      })),
    };
  }

  private async replaceItems(subscriptionId: string, rows: CreateSubscriptionDto['items']): Promise<void> {
    await this.items.delete({ subscriptionId });
    await this.items.save(rows.map((row) => this.items.create({
      subscriptionId,
      itemId: row.itemId,
      variantId: row.variantId ?? null,
      quantity: row.quantity,
      modifiers: row.modifiers ?? {},
    })));
  }

  private nextRunDate(schedule: SubscriptionSchedule, from: Date): Date {
    const next = new Date(from);
    if (schedule === SubscriptionSchedule.WEEKLY) next.setDate(next.getDate() + 7);
    if (schedule === SubscriptionSchedule.BIWEEKLY) next.setDate(next.getDate() + 14);
    if (schedule === SubscriptionSchedule.MONTHLY) next.setMonth(next.getMonth() + 1);
    return next;
  }

  private async requireCustomer(tenantId: string, customerId: string): Promise<CustomerEntity> {
    const customer = await this.customers.findOne({ where: { tenantId, id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private async notify(customer: CustomerEntity, subject: string, message: string): Promise<void> {
    const recipient = customer.email ?? customer.phone;
    if (!recipient) return;
    await this.notifications.createAndSend(customer.tenantId, {
      type: NotificationType.SUBSCRIPTION,
      channel: customer.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
      recipient,
      payload: { templateName: 'system', subject, message },
    });
  }

  private topProducts(rows: SubscriptionEntity[]) {
    const counts = new Map<string, number>();
    for (const row of rows) {
      for (const item of row.items ?? []) counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + item.quantity);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([itemId, quantity]) => ({ itemId, quantity }));
  }
}
