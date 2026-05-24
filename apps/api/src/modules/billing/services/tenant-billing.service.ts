import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { SubscriptionPlan } from '../../onboarding/enums/subscription-plan.enum';
import { TenantBillingEntity } from '../../onboarding/entities/tenant-billing.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { TenantAccessService } from '../../onboarding/services/tenant-access.service';
import { BillingPlanRegistry } from '../registry/billing-plan.registry';
import { BillingRepository } from '../repositories/billing.repository';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { BillingNotConfiguredError } from '../errors/billing.errors';
import { StripeClientService } from './stripe-client.service';
import { UsageTrackingService } from './usage-tracking.service';

@Injectable()
export class TenantBillingService {
  private readonly logger = new Logger(TenantBillingService.name);

  constructor(
    private readonly repository: BillingRepository,
    private readonly stripeClient: StripeClientService,
    private readonly usageTracking: UsageTrackingService,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async getBillingSummary(tenantId: string) {
    const billing = await this.requireBillingRecord(tenantId);
    const plan = BillingPlanRegistry.getPlan(billing.plan);
    const usage = await this.usageTracking.getUsageSnapshot(tenantId);

    return {
      plan: billing.plan,
      planName: plan?.name ?? billing.plan,
      billingEmail: billing.billingEmail,
      subscriptionStatus: billing.subscriptionStatus,
      trialEndsAt: billing.trialEndsAt?.toISOString() ?? null,
      currentPeriodStart: billing.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: billing.currentPeriodEnd?.toISOString() ?? null,
      paymentMethod: this.maskPaymentMethod(billing.paymentMethod),
      stripeConfigured: this.stripeClient.isConfigured(),
      usage,
      plans: BillingPlanRegistry.listPlans(),
    };
  }

  async createStripeCustomer(tenant: TenantEntity, billingEmail?: string): Promise<TenantBillingEntity> {
    let billing = await this.repository.findBilling(tenant.id);
    if (!billing) {
      billing = await this.repository.saveBilling({
        tenantId: tenant.id,
        plan: SubscriptionPlan.FREE,
        billingEmail: billingEmail ?? null,
        paymentMethod: {},
        subscriptionStatus: SubscriptionStatus.INACTIVE,
      });
    }

    if (billing.stripeCustomerId) {
      return billing;
    }

    if (!this.stripeClient.isConfigured()) {
      billing.stripeCustomerId = `cus_placeholder_${tenant.id.slice(0, 8)}`;
      return this.repository.saveBilling(billing);
    }

    const customer = await this.stripeClient.client().customers.create({
      email: billingEmail ?? billing.billingEmail ?? undefined,
      name: tenant.name,
      metadata: { tenantId: tenant.id },
    });

    billing.stripeCustomerId = customer.id;
    if (billingEmail) {
      billing.billingEmail = billingEmail;
    }
    return this.repository.saveBilling(billing);
  }

  async attachPaymentMethod(
    user: AuthenticatedUser,
    tenant: TenantContext,
    paymentMethodId: string,
  ): Promise<TenantBillingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const tenantEntity = await this.repository.findTenant(tenant.tenantId);
    if (!tenantEntity) {
      throw new NotFoundException('Tenant not found');
    }

    const billing = await this.createStripeCustomer(tenantEntity);

    if (!this.stripeClient.isConfigured()) {
      billing.paymentMethod = {
        provider: 'stripe',
        paymentMethodId,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      };
      return this.repository.saveBilling(billing);
    }

    const stripe = this.stripeClient.client();
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: billing.stripeCustomerId!,
    });
    await stripe.customers.update(billing.stripeCustomerId!, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    billing.paymentMethod = {
      provider: 'stripe',
      paymentMethodId: pm.id,
      brand: pm.card?.brand ?? null,
      last4: pm.card?.last4 ?? null,
      expMonth: pm.card?.exp_month ?? null,
      expYear: pm.card?.exp_year ?? null,
    };
    return this.repository.saveBilling(billing);
  }

  async subscribeToPlan(
    user: AuthenticatedUser,
    tenant: TenantContext,
    planId: string,
    paymentMethodId?: string,
  ): Promise<TenantBillingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const plan = BillingPlanRegistry.getPlan(planId);
    if (!plan) {
      throw new NotFoundException(`Unknown plan: ${planId}`);
    }
    if (plan.custom) {
      throw new BillingNotConfiguredError('Enterprise plans require sales contact');
    }
    if (planId === SubscriptionPlan.FREE) {
      return this.handlePlanChange(user, tenant, planId);
    }

    const tenantEntity = await this.repository.findTenant(tenant.tenantId);
    if (!tenantEntity) {
      throw new NotFoundException('Tenant not found');
    }

    let billing = await this.createStripeCustomer(tenantEntity);
    if (paymentMethodId) {
      billing = await this.attachPaymentMethod(user, tenant, paymentMethodId);
    }

    if (!this.stripeClient.isConfigured()) {
      billing.plan = planId as SubscriptionPlan;
      billing.subscriptionStatus = SubscriptionStatus.ACTIVE;
      billing.stripeSubscriptionId = `sub_placeholder_${tenant.tenantId.slice(0, 8)}`;
      billing.currentPeriodStart = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      billing.currentPeriodEnd = end;
      return this.repository.saveBilling(billing);
    }

    const priceId = this.stripeClient.getPriceIdForPlan(planId);
    if (!priceId) {
      throw new BillingNotConfiguredError(`Stripe price not configured for plan ${planId}`);
    }

    const stripe = this.stripeClient.client();
    const subscription = await stripe.subscriptions.create({
      customer: billing.stripeCustomerId!,
      items: [{ price: priceId }],
      metadata: { tenantId: tenant.tenantId, planId },
      trial_period_days: planId === SubscriptionPlan.STARTER ? 14 : undefined,
    });

    return this.applySubscriptionToBilling(billing, subscription, planId as SubscriptionPlan);
  }

  async handlePlanChange(
    user: AuthenticatedUser,
    tenant: TenantContext,
    newPlanId: string,
  ): Promise<TenantBillingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const plan = BillingPlanRegistry.getPlan(newPlanId);
    if (!plan) {
      throw new NotFoundException(`Unknown plan: ${newPlanId}`);
    }

    await this.usageTracking.validateDowngrade(tenant.tenantId, newPlanId);

    const billing = await this.requireBillingRecord(tenant.tenantId);

    if (newPlanId === SubscriptionPlan.FREE) {
      if (billing.stripeSubscriptionId && this.stripeClient.isConfigured()) {
        await this.stripeClient.client().subscriptions.cancel(billing.stripeSubscriptionId);
      }
      billing.plan = SubscriptionPlan.FREE;
      billing.subscriptionStatus = SubscriptionStatus.CANCELED;
      billing.stripeSubscriptionId = null;
      billing.hardLimitExceeded = false;
      billing.softLimitWarned = false;
      return this.repository.saveBilling(billing);
    }

    if (plan.custom) {
      billing.plan = SubscriptionPlan.ENTERPRISE;
      billing.subscriptionStatus = SubscriptionStatus.ACTIVE;
      return this.repository.saveBilling(billing);
    }

    if (!billing.stripeSubscriptionId || !this.stripeClient.isConfigured()) {
      billing.plan = newPlanId as SubscriptionPlan;
      billing.subscriptionStatus = SubscriptionStatus.ACTIVE;
      return this.repository.saveBilling(billing);
    }

    const priceId = this.stripeClient.getPriceIdForPlan(newPlanId);
    if (!priceId) {
      throw new BillingNotConfiguredError(`Stripe price not configured for plan ${newPlanId}`);
    }

    const stripe = this.stripeClient.client();
    const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      throw new BillingNotConfiguredError('Subscription has no items');
    }

    const updated = await stripe.subscriptions.update(billing.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      metadata: { tenantId: tenant.tenantId, planId: newPlanId },
      proration_behavior: 'create_prorations',
    });

    return this.applySubscriptionToBilling(billing, updated, newPlanId as SubscriptionPlan);
  }

  async syncStripeSubscriptionStatus(subscription: Stripe.Subscription): Promise<TenantBillingEntity | null> {
    const tenantId = subscription.metadata?.tenantId;
    let billing = tenantId
      ? await this.repository.findBilling(tenantId)
      : await this.repository.findBillingByStripeSubscription(subscription.id);

    if (!billing) {
      this.logger.warn(`No billing record for subscription ${subscription.id}`);
      return null;
    }

    const planId =
      (subscription.metadata?.planId as SubscriptionPlan) ??
      this.planFromPrice(subscription) ??
      billing.plan;

    return this.applySubscriptionToBilling(billing, subscription, planId);
  }

  async createBillingPortalSession(
    user: AuthenticatedUser,
    tenant: TenantContext,
    returnUrl?: string,
  ): Promise<{ url: string }> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const tenantEntity = await this.repository.findTenant(tenant.tenantId);
    if (!tenantEntity) {
      throw new NotFoundException('Tenant not found');
    }

    const billing = await this.createStripeCustomer(tenantEntity);
    const fallback = `${this.stripeClient.adminBaseUrl()}/settings/billing`;

    if (!this.stripeClient.isConfigured() || !billing.stripeCustomerId) {
      return { url: returnUrl ?? fallback };
    }

    const session = await this.stripeClient.client().billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: returnUrl ?? fallback,
    });

    return { url: session.url };
  }

  async createSubscriptionCheckoutSession(
    user: AuthenticatedUser,
    tenant: TenantContext,
    planId: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ sessionId: string; url: string }> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const plan = BillingPlanRegistry.getPlan(planId);
    if (!plan || plan.custom) {
      throw new BillingNotConfiguredError('Plan is not available for self-serve checkout');
    }

    const tenantEntity = await this.repository.findTenant(tenant.tenantId);
    if (!tenantEntity) {
      throw new NotFoundException('Tenant not found');
    }

    const billing = await this.createStripeCustomer(tenantEntity);
    const base = this.stripeClient.adminBaseUrl();
    const success = successUrl ?? `${base}/settings/billing?checkout=success`;
    const cancel = cancelUrl ?? `${base}/settings/billing?checkout=cancel`;

    if (!this.stripeClient.isConfigured()) {
      return {
        sessionId: `cs_sub_placeholder_${tenant.tenantId.slice(0, 8)}`,
        url: success,
      };
    }

    const priceId = this.stripeClient.getPriceIdForPlan(planId);
    if (!priceId) {
      throw new BillingNotConfiguredError(`Stripe price not configured for plan ${planId}`);
    }

    const session = await this.stripeClient.client().checkout.sessions.create({
      mode: 'subscription',
      customer: billing.stripeCustomerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      metadata: {
        tenantId: tenant.tenantId,
        planId,
        type: 'subscription_checkout',
      },
      subscription_data: {
        metadata: { tenantId: tenant.tenantId, planId },
        trial_period_days: planId === SubscriptionPlan.STARTER ? 14 : undefined,
      },
    });

    if (!session.url) {
      throw new BillingNotConfiguredError('Stripe did not return a checkout URL');
    }

    return { sessionId: session.id, url: session.url };
  }

  async cancelSubscription(
    user: AuthenticatedUser,
    tenant: TenantContext,
  ): Promise<TenantBillingEntity> {
    return this.handlePlanChange(user, tenant, SubscriptionPlan.FREE);
  }

  async listInvoices(tenantId: string): Promise<unknown[]> {
    const billing = await this.requireBillingRecord(tenantId);
    if (!billing.stripeCustomerId) {
      return [];
    }

    if (!this.stripeClient.isConfigured()) {
      return [
        {
          id: 'in_placeholder_1',
          status: 'paid',
          amountDue: 0,
          currency: 'gbp',
          created: new Date().toISOString(),
          hostedInvoiceUrl: null,
        },
      ];
    }

    const invoices = await this.stripeClient.client().invoices.list({
      customer: billing.stripeCustomerId,
      limit: 24,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      status: inv.status,
      amountDue: inv.amount_due,
      currency: inv.currency,
      created: new Date((inv.created ?? 0) * 1000).toISOString(),
      hostedInvoiceUrl: inv.hosted_invoice_url,
    }));
  }

  private async applySubscriptionToBilling(
    billing: TenantBillingEntity,
    subscription: Stripe.Subscription,
    plan: SubscriptionPlan,
  ): Promise<TenantBillingEntity> {
    billing.stripeSubscriptionId = subscription.id;
    billing.plan = plan;
    billing.subscriptionStatus = subscription.status as SubscriptionStatus;
    billing.trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;
    billing.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    billing.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    return this.repository.saveBilling(billing);
  }

  private planFromPrice(subscription: Stripe.Subscription): SubscriptionPlan | null {
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) return null;
    for (const plan of BillingPlanRegistry.listPlans()) {
      if (!plan.stripePriceEnvKey) continue;
      const envPrice = this.stripeClient.getPriceIdForPlan(plan.id);
      if (envPrice === priceId) {
        return plan.id as SubscriptionPlan;
      }
    }
    return null;
  }

  private async requireBillingRecord(tenantId: string): Promise<TenantBillingEntity> {
    const billing = await this.repository.findBilling(tenantId);
    if (!billing) {
      return this.repository.saveBilling({
        tenantId,
        plan: SubscriptionPlan.FREE,
        billingEmail: null,
        paymentMethod: {},
        subscriptionStatus: SubscriptionStatus.INACTIVE,
      });
    }
    return billing;
  }

  private maskPaymentMethod(pm: Record<string, unknown>): Record<string, unknown> {
    const { paymentMethodId: _removed, ...safe } = pm;
    return safe;
  }
}
