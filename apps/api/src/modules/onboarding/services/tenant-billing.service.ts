import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { TenantBillingEntity } from '../entities';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';

@Injectable()
export class TenantBillingService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async getBilling(tenantId: string): Promise<TenantBillingEntity | null> {
    return this.repository.findBilling(tenantId);
  }

  async updateBilling(
    user: AuthenticatedUser,
    tenant: TenantContext,
    body: {
      plan?: SubscriptionPlan;
      billingEmail?: string;
      paymentMethod?: Record<string, unknown>;
    },
  ): Promise<TenantBillingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBilling(tenant.tenantId);
    if (!existing) {
      return this.repository.saveBilling({
        tenantId: tenant.tenantId,
        plan: body.plan ?? SubscriptionPlan.FREE,
        billingEmail: body.billingEmail ?? null,
        paymentMethod: body.paymentMethod ?? { provider: 'placeholder' },
      });
    }

    if (body.plan) existing.plan = body.plan;
    if (body.billingEmail) existing.billingEmail = body.billingEmail;
    if (body.paymentMethod) {
      existing.paymentMethod = { ...existing.paymentMethod, ...body.paymentMethod };
    }
    return this.repository.saveBilling(existing);
  }
}
