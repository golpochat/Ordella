import { SubscriptionPlan } from '../../onboarding/enums/subscription-plan.enum';

export type BillingPlanId = SubscriptionPlan | string;

export interface BillingPlanDefinition {
  id: BillingPlanId;
  name: string;
  /** null = unlimited */
  locationLimit: number | null;
  /** null = unlimited / negotiated (enterprise) */
  orderLimit: number | null;
  /** Requires sales contact — limits are custom */
  custom: boolean;
  stripePriceEnvKey?: string;
}

const PLANS: Record<string, BillingPlanDefinition> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: 'Free',
    locationLimit: 1,
    orderLimit: 100,
    custom: false,
  },
  [SubscriptionPlan.STARTER]: {
    id: SubscriptionPlan.STARTER,
    name: 'Starter',
    locationLimit: 3,
    orderLimit: 1_000,
    custom: false,
    stripePriceEnvKey: 'STRIPE_PRICE_STARTER',
  },
  [SubscriptionPlan.PRO]: {
    id: SubscriptionPlan.PRO,
    name: 'Pro',
    locationLimit: null,
    orderLimit: 10_000,
    custom: false,
    stripePriceEnvKey: 'STRIPE_PRICE_PRO',
  },
  [SubscriptionPlan.ENTERPRISE]: {
    id: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    locationLimit: null,
    orderLimit: null,
    custom: true,
    stripePriceEnvKey: 'STRIPE_PRICE_ENTERPRISE',
  },
};

export class BillingPlanRegistry {
  static getPlan(planId: string): BillingPlanDefinition | undefined {
    return PLANS[planId];
  }

  static listPlans(): BillingPlanDefinition[] {
    return Object.values(PLANS);
  }

  static isUnlimited(value: number | null): boolean {
    return value === null;
  }
}
