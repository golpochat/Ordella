import { Injectable, Logger } from '@nestjs/common';
import { BillingPlanRegistry } from '../registry/billing-plan.registry';
import { BillingRepository } from '../repositories/billing.repository';
import {
  PlanDowngradeNotAllowedError,
  PlanLimitExceededError,
} from '../errors/billing.errors';
import { StripeClientService } from './stripe-client.service';
import { TenantBillingEntity } from '../../onboarding/entities/tenant-billing.entity';

const SOFT_THRESHOLD_RATIO = 0.9;

export interface TenantUsageSnapshot {
  tenantId: string;
  planId: string;
  locationsUsed: number;
  locationLimit: number | null;
  ordersUsed: number;
  orderLimit: number | null;
  softLimitWarned: boolean;
  hardLimitExceeded: boolean;
  usagePeriodStart: string | null;
}

@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(
    private readonly repository: BillingRepository,
    private readonly stripeClient: StripeClientService,
  ) {}

  async getUsageSnapshot(tenantId: string): Promise<TenantUsageSnapshot> {
    const billing = await this.requireBilling(tenantId);
    await this.syncLocationCount(tenantId);
    const plan = BillingPlanRegistry.getPlan(billing.plan);
    const locationsUsed = await this.repository.countLocations(tenantId);

    return {
      tenantId,
      planId: billing.plan,
      locationsUsed,
      locationLimit: plan?.locationLimit ?? null,
      ordersUsed: billing.ordersUsedPeriod,
      orderLimit: plan?.orderLimit ?? null,
      softLimitWarned: billing.softLimitWarned,
      hardLimitExceeded: billing.hardLimitExceeded,
      usagePeriodStart: billing.usagePeriodStart?.toISOString() ?? null,
    };
  }

  async recordOrderUsage(tenantId: string): Promise<TenantUsageSnapshot> {
    const billing = await this.requireBilling(tenantId);
    await this.ensureUsagePeriod(billing);
    billing.ordersUsedPeriod += 1;
    await this.repository.saveBilling(billing);
    await this.evaluateLimits(tenantId);
    return this.getUsageSnapshot(tenantId);
  }

  async recordLocationUsage(tenantId: string): Promise<TenantUsageSnapshot> {
    await this.syncLocationCount(tenantId);
    await this.evaluateLimits(tenantId);
    return this.getUsageSnapshot(tenantId);
  }

  async assertWithinLimits(tenantId: string, kind: 'order' | 'location'): Promise<void> {
    const snapshot = await this.getUsageSnapshot(tenantId);
    if (snapshot.hardLimitExceeded) {
      throw new PlanLimitExceededError(
        `${kind} limit exceeded for plan ${snapshot.planId}. Upgrade your subscription.`,
      );
    }

    if (kind === 'order' && snapshot.orderLimit !== null) {
      if (snapshot.ordersUsed >= snapshot.orderLimit) {
        throw new PlanLimitExceededError('Monthly order limit reached.');
      }
    }

    if (kind === 'location' && snapshot.locationLimit !== null) {
      if (snapshot.locationsUsed >= snapshot.locationLimit) {
        throw new PlanLimitExceededError('Location limit reached for your plan.');
      }
    }
  }

  async validateDowngrade(tenantId: string, newPlanId: string): Promise<void> {
    const plan = BillingPlanRegistry.getPlan(newPlanId);
    if (!plan) {
      throw new PlanDowngradeNotAllowedError(`Unknown plan: ${newPlanId}`);
    }
    if (plan.custom) {
      return;
    }

    const snapshot = await this.getUsageSnapshot(tenantId);

    if (
      plan.locationLimit !== null &&
      snapshot.locationsUsed > plan.locationLimit
    ) {
      throw new PlanDowngradeNotAllowedError(
        `Cannot downgrade: ${snapshot.locationsUsed} locations in use but ${plan.name} allows ${plan.locationLimit}.`,
      );
    }

    if (plan.orderLimit !== null && snapshot.ordersUsed > plan.orderLimit) {
      throw new PlanDowngradeNotAllowedError(
        `Cannot downgrade: ${snapshot.ordersUsed} orders this period but ${plan.name} allows ${plan.orderLimit}/month.`,
      );
    }
  }

  /** Placeholder for Stripe metered billing sync */
  async syncStripeMeteredUsage(tenantId: string): Promise<void> {
    const billing = await this.requireBilling(tenantId);
    if (!this.stripeClient.isConfigured() || !billing.stripeSubscriptionId) {
      this.logger.debug(
        `[placeholder] syncStripeMeteredUsage tenant=${tenantId} orders=${billing.ordersUsedPeriod}`,
      );
      return;
    }
    this.logger.debug(
      `Metered usage sync placeholder: tenant=${tenantId} quantity=${billing.ordersUsedPeriod}`,
    );
  }

  private async syncLocationCount(tenantId: string): Promise<number> {
    return this.repository.countLocations(tenantId);
  }

  private async ensureUsagePeriod(billing: TenantBillingEntity): Promise<void> {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    if (!billing.usagePeriodStart || billing.usagePeriodStart < monthStart) {
      billing.usagePeriodStart = monthStart;
      billing.ordersUsedPeriod = 0;
      billing.softLimitWarned = false;
      billing.hardLimitExceeded = false;
      await this.repository.saveBilling(billing);
    }
  }

  private async evaluateLimits(tenantId: string): Promise<void> {
    const billing = await this.requireBilling(tenantId);
    const plan = BillingPlanRegistry.getPlan(billing.plan);
    if (!plan || plan.custom) {
      return;
    }

    const locationsUsed = await this.repository.countLocations(tenantId);
    let hard = false;
    let soft = billing.softLimitWarned;

    if (plan.orderLimit !== null) {
      if (billing.ordersUsedPeriod >= plan.orderLimit) {
        hard = true;
      } else if (billing.ordersUsedPeriod >= plan.orderLimit * SOFT_THRESHOLD_RATIO) {
        soft = true;
      }
    }

    if (plan.locationLimit !== null && locationsUsed >= plan.locationLimit) {
      hard = true;
    } else if (
      plan.locationLimit !== null &&
      locationsUsed >= plan.locationLimit * SOFT_THRESHOLD_RATIO
    ) {
      soft = true;
    }

    billing.softLimitWarned = soft;
    billing.hardLimitExceeded = hard;
    await this.repository.saveBilling(billing);
  }

  private async requireBilling(tenantId: string): Promise<TenantBillingEntity> {
    const billing = await this.repository.findBilling(tenantId);
    if (!billing) {
      throw new PlanLimitExceededError('Tenant billing record not found');
    }
    return billing;
  }
}
