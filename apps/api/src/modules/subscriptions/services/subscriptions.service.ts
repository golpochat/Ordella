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
import { CreateSubscriptionDto, SubscribeToPlanDto, UpdateSubscriptionDto, UpsertSubscriptionPlanDto } from '../dto';
import {
  SubscriptionBillingCycle,
  SubscriptionEntity,
  SubscriptionItemEntity,
  SubscriptionOrderEntity,
  SubscriptionOrderStatus,
  SubscriptionPlanEntity,
  SubscriptionPlanStatus,
  SubscriptionSchedule,
  SubscriptionStatus,
} from '../entities';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private readonly plans: Repository<SubscriptionPlanEntity>,
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
      relations: { customer: true, items: true, orders: true, plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async get(tenant: TenantContext, id: string, customerId?: string): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptions.findOne({
      where: { id, tenantId: tenant.tenantId, ...(customerId ? { customerId } : {}) },
      relations: { customer: true, items: true, orders: true, plan: true },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async listPlans(tenant: TenantContext, includeArchived = false): Promise<SubscriptionPlanEntity[]> {
    return this.plans.find({
      where: { tenantId: tenant.tenantId, ...(includeArchived ? {} : { status: SubscriptionPlanStatus.ACTIVE }) },
      order: { price: 'ASC', createdAt: 'DESC' },
    });
  }

  async upsertPlan(tenant: TenantContext, dto: UpsertSubscriptionPlanDto): Promise<SubscriptionPlanEntity> {
    const existing = dto.id ? await this.plans.findOne({ where: { tenantId: tenant.tenantId, id: dto.id } }) : null;
    return this.plans.save(this.plans.create({
      ...(existing ?? {}),
      tenantId: tenant.tenantId,
      name: dto.name.trim(),
      price: dto.price.toFixed(2),
      billingCycle: dto.billingCycle,
      perks: this.normalizePerks(dto.perks),
      trialPeriod: dto.trialPeriod ?? 0,
      status: dto.status ?? SubscriptionPlanStatus.ACTIVE,
    }));
  }

  async subscribeToPlan(
    tenant: TenantContext,
    customerId: string,
    dto: SubscribeToPlanDto,
  ): Promise<SubscriptionEntity> {
    const [customer, plan] = await Promise.all([
      this.requireCustomer(tenant.tenantId, customerId),
      this.requirePlan(tenant.tenantId, dto.planId),
    ]);
    const startDate = new Date();
    const renewalDate = this.nextRenewalDate(plan.billingCycle, startDate, plan.trialPeriod);
    const subscription = await this.subscriptions.save(this.subscriptions.create({
      tenantId: tenant.tenantId,
      customerId: customer.id,
      planId: plan.id,
      locationId: null,
      orderType: OrderType.ONLINE,
      schedule: plan.billingCycle === SubscriptionBillingCycle.YEARLY ? SubscriptionSchedule.YEARLY : SubscriptionSchedule.MONTHLY,
      billingCycle: plan.billingCycle,
      startDate,
      renewalDate,
      nextRunAt: renewalDate,
      status: SubscriptionStatus.ACTIVE,
      totalPrice: plan.price,
      paymentMethodId: dto.paymentMethodId ?? null,
      refundPolicy: dto.refundPolicy ?? this.defaultRefundPolicy(),
      deliveryDetails: null,
    }));
    await this.applyMembershipSegments(customer, plan, true);
    await this.notify(customer, 'Membership started', `Your ${plan.name} membership is active. You can cancel any time before renewal.`);
    return this.get(tenant, subscription.id, customer.id);
  }

  async create(tenant: TenantContext, dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    const customer = await this.requireCustomer(tenant.tenantId, dto.customerId);
    const subscription = await this.subscriptions.save(this.subscriptions.create({
      tenantId: tenant.tenantId,
      customerId: customer.id,
      locationId: dto.locationId,
      planId: dto.planId ?? null,
      orderType: dto.orderType ?? OrderType.PICKUP,
      schedule: dto.schedule,
      billingCycle: null,
      startDate: new Date(),
      renewalDate: null,
      nextRunAt: dto.nextRunAt ? new Date(dto.nextRunAt) : this.nextRunDate(dto.schedule, new Date()),
      status: SubscriptionStatus.ACTIVE,
      totalPrice: dto.totalPrice.toFixed(2),
      paymentMethodId: dto.paymentMethodId ?? null,
      refundPolicy: this.defaultRefundPolicy(),
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
    if (dto.paymentMethod !== undefined) subscription.paymentMethodId = dto.paymentMethod || null;
    if (dto.deliveryDetails !== undefined) subscription.deliveryDetails = dto.deliveryDetails;
    await this.subscriptions.save(subscription);
    if (dto.items) await this.replaceItems(subscription.id, dto.items);
    return this.get(tenant, id, customerId);
  }

  async setStatus(tenant: TenantContext, id: string, status: SubscriptionStatus, customerId?: string): Promise<SubscriptionEntity> {
    const subscription = await this.get(tenant, id, customerId);
    subscription.status = status;
    if (status === SubscriptionStatus.CANCELLED || status === SubscriptionStatus.CANCELED) {
      subscription.canceledAt = new Date();
      subscription.cancelAtPeriodEnd = true;
      if (subscription.customer && subscription.plan) {
        await this.applyMembershipSegments(subscription.customer, subscription.plan, false);
      }
    }
    await this.subscriptions.save(subscription);
    if (subscription.customer) {
      await this.notify(subscription.customer, 'Subscription updated', `Your subscription was ${status}.`);
    }
    return this.get(tenant, id, customerId);
  }

  async analytics(tenant: TenantContext) {
    const rows = await this.subscriptions.find({ where: { tenantId: tenant.tenantId }, relations: { items: true } });
    const active = rows.filter((row) => row.status === SubscriptionStatus.ACTIVE);
    const memberships = rows.filter((row) => row.planId);
    const activeMemberships = memberships.filter((row) => row.status === SubscriptionStatus.ACTIVE);
    const subscriptionRevenue = rows.reduce((sum, row) => sum + Number(row.totalPrice), 0);
    const recurringRevenueForecast = active.reduce((sum, row) => {
      const multiplier = this.monthlyMultiplier(row.schedule, row.billingCycle);
      return sum + Number(row.totalPrice) * multiplier;
    }, 0);
    const canceled = rows.filter((row) => row.status === SubscriptionStatus.CANCELLED || row.status === SubscriptionStatus.CANCELED);
    const churnRate = rows.length ? Number(((canceled.length / rows.length) * 100).toFixed(2)) : 0;
    const mrr = activeMemberships.reduce((sum, row) => sum + Number(row.totalPrice) * this.monthlyMultiplier(row.schedule, row.billingCycle), 0);
    const planPerformance = await this.planPerformance(tenant.tenantId, memberships);
    return {
      activeSubscriptions: active.length,
      subscriptionRevenue: subscriptionRevenue.toFixed(2),
      recurringRevenueForecast: recurringRevenueForecast.toFixed(2),
      churnRate,
      mrr: mrr.toFixed(2),
      activeMembers: activeMemberships.length,
      subscriberLtv: activeMemberships.length ? (subscriptionRevenue / activeMemberships.length).toFixed(2) : '0.00',
      planPerformance,
      topSubscriptionProducts: this.topProducts(rows),
    };
  }

  async processDue(now = new Date()): Promise<number> {
    const due = await this.subscriptions.find({
      where: { status: SubscriptionStatus.ACTIVE, nextRunAt: LessThanOrEqual(now) },
      relations: { customer: true, items: true, plan: true },
      take: 50,
    });
    for (const subscription of due) await this.processRun(subscription);
    return due.length;
  }

  private async processRun(subscription: SubscriptionEntity): Promise<void> {
    try {
      if (subscription.planId) {
        await this.processMembershipRenewal(subscription);
        return;
      }
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
      if (!subscription.schedule) throw new BadRequestException('Missing subscription schedule');
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
        subscription.failedPaymentAttempts = retryCount;
        subscription.lastPaymentFailedAt = new Date();
        await this.subscriptions.save(subscription);
      }
      if (subscription.customer) await this.notify(subscription.customer, 'Subscription issue', 'We could not process your recurring order. Please update your subscription.');
    }
  }

  private toCreateOrderDto(subscription: SubscriptionEntity): CreateOrderDto {
    if (!subscription.locationId) throw new BadRequestException('Missing subscription location');
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
    if (schedule === SubscriptionSchedule.YEARLY) next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  private async processMembershipRenewal(subscription: SubscriptionEntity): Promise<void> {
    if (!subscription.plan) {
      subscription.plan = await this.plans.findOne({ where: { id: subscription.planId ?? '', tenantId: subscription.tenantId } });
    }
    const plan = subscription.plan;
    if (!plan) throw new BadRequestException('Membership plan not found');

    if (this.stripeClient.isConfigured()) {
      if (!subscription.paymentMethodId) throw new BadRequestException('Missing saved payment method');
      await this.stripeClient.client().paymentIntents.create({
        amount: Math.round(Number(plan.price) * 100),
        currency: 'eur',
        payment_method: subscription.paymentMethodId,
        confirm: true,
        off_session: true,
        metadata: {
          subscriptionId: subscription.id,
          planId: plan.id,
          tenantId: subscription.tenantId,
          type: 'membership_renewal',
        },
      });
    }

    subscription.totalPrice = plan.price;
    subscription.failedPaymentAttempts = 0;
    subscription.lastPaymentFailedAt = null;
    subscription.renewalDate = this.nextRenewalDate(plan.billingCycle, subscription.renewalDate ?? new Date());
    subscription.nextRunAt = subscription.renewalDate;
    if (subscription.cancelAtPeriodEnd) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription.canceledAt = subscription.canceledAt ?? new Date();
    }
    await this.subscriptions.save(subscription);
    if (subscription.customer) {
      await this.notify(subscription.customer, 'Membership renewed', `Your ${plan.name} membership has renewed.`);
    }
  }

  private nextRenewalDate(cycle: SubscriptionBillingCycle, from: Date, trialPeriod = 0): Date {
    const next = new Date(from);
    if (trialPeriod > 0) {
      next.setDate(next.getDate() + trialPeriod);
      return next;
    }
    if (cycle === SubscriptionBillingCycle.YEARLY) next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return next;
  }

  private monthlyMultiplier(schedule: SubscriptionSchedule | null, billingCycle: SubscriptionBillingCycle | null): number {
    if (billingCycle === SubscriptionBillingCycle.YEARLY || schedule === SubscriptionSchedule.YEARLY) return 1 / 12;
    if (schedule === SubscriptionSchedule.WEEKLY) return 4;
    if (schedule === SubscriptionSchedule.BIWEEKLY) return 2;
    return 1;
  }

  private normalizePerks(perks: UpsertSubscriptionPlanDto['perks']) {
    const discountPercent = Number(perks.discountPercent ?? perks.discounts ?? 0);
    const pointsMultiplier = Number(perks.pointsMultiplier ?? 1);
    return {
      freeDelivery: Boolean(perks.freeDelivery),
      discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
      pointsMultiplier: Number.isFinite(pointsMultiplier) && pointsMultiplier > 0 ? pointsMultiplier : 1,
      exclusiveItems: Array.isArray(perks.exclusiveItems) ? perks.exclusiveItems : [],
      description: Array.isArray(perks.description) ? perks.description : [],
    };
  }

  private defaultRefundPolicy(): Record<string, unknown> {
    return {
      cancellation: 'Cancel anytime. Access remains until the current renewal date.',
      refunds: 'Refunds are reviewed against tenant policy and unused membership period.',
    };
  }

  private async requirePlan(tenantId: string, planId: string): Promise<SubscriptionPlanEntity> {
    const plan = await this.plans.findOne({ where: { tenantId, id: planId, status: SubscriptionPlanStatus.ACTIVE } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  private async planPerformance(tenantId: string, memberships: SubscriptionEntity[]) {
    const plans = await this.plans.find({ where: { tenantId } });
    return plans.map((plan) => {
      const planRows = memberships.filter((row) => row.planId === plan.id);
      const active = planRows.filter((row) => row.status === SubscriptionStatus.ACTIVE);
      const canceled = planRows.filter((row) => row.status === SubscriptionStatus.CANCELLED || row.status === SubscriptionStatus.CANCELED);
      const mrr = active.reduce((sum, row) => sum + Number(row.totalPrice) * this.monthlyMultiplier(row.schedule, row.billingCycle), 0);
      return {
        planId: plan.id,
        name: plan.name,
        activeSubscribers: active.length,
        canceledSubscribers: canceled.length,
        mrr: mrr.toFixed(2),
        churnRate: planRows.length ? Number(((canceled.length / planRows.length) * 100).toFixed(2)) : 0,
      };
    });
  }

  private async applyMembershipSegments(customer: CustomerEntity, plan: SubscriptionPlanEntity, active: boolean): Promise<void> {
    const segments = new Set(customer.segments ?? []);
    const keys = ['subscriber', `subscriber:${plan.id}`, `subscriber:${plan.name.toLowerCase().replace(/\s+/g, '-')}`];
    for (const key of keys) {
      if (active) segments.add(key);
      else segments.delete(key);
    }
    const existingMultiplier = Number(customer.preferences?.subscriptionPointsMultiplier ?? 1);
    const planMultiplier = Number(plan.perks?.pointsMultiplier ?? 1);
    customer.segments = [...segments];
    customer.preferences = {
      ...(customer.preferences ?? {}),
      subscriptionFreeDelivery: active ? Boolean(plan.perks?.freeDelivery) : false,
      subscriptionDiscountPercent: active ? Number(plan.perks?.discountPercent ?? 0) : 0,
      subscriptionPointsMultiplier: active ? Math.max(existingMultiplier, planMultiplier) : 1,
    };
    await this.customers.save(customer);
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
