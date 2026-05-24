import { formatPrice, type CurrencyCode } from '@/lib/currency';

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

export const PLAN_MONTHLY_AMOUNTS: Record<PlanId, number | null> = {
  free: 0,
  starter: 79,
  pro: 199,
  enterprise: null,
};

export type Plan = {
  id: PlanId;
  name: string;
  priceAmount: number | null;
  priceDetail: string;
  description: string;
  locations: string;
  ordersPerMonth: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceAmount: PLAN_MONTHLY_AMOUNTS.free,
    priceDetail: 'forever',
    description: 'Pilot a single location and prove the workflow.',
    locations: '1',
    ordersPerMonth: '100',
    cta: 'Start free',
    features: ['Admin dashboard', 'POS & KDS', 'Branded storefront', 'Subdomain'],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceAmount: PLAN_MONTHLY_AMOUNTS.starter,
    priceDetail: '/ month',
    description: 'Independent restaurants ready to grow online and in-store.',
    locations: '3',
    ordersPerMonth: '1,000',
    cta: 'Start 14-day trial',
    highlighted: true,
    features: ['Everything in Free', 'Custom domain', 'Staff invites', 'Delivery module'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceAmount: PLAN_MONTHLY_AMOUNTS.pro,
    priceDetail: '/ month',
    description: 'Busy brands with unlimited locations and high order volume.',
    locations: 'Unlimited',
    ordersPerMonth: '10,000',
    cta: 'Start 14-day trial',
    features: ['Everything in Starter', 'Advanced reports', 'Promotions', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceAmount: PLAN_MONTHLY_AMOUNTS.enterprise,
    priceDetail: 'contact sales',
    description: 'Franchises and groups that need SLAs and tailored limits.',
    locations: 'Custom',
    ordersPerMonth: 'Custom',
    cta: 'Contact sales',
    features: ['Dedicated onboarding', 'Custom contracts', 'SLA', 'Volume pricing'],
  },
];

export function formatPlanPrice(plan: Plan, currency: CurrencyCode): string {
  if (plan.priceAmount === null) {
    return 'Custom';
  }
  return formatPrice(plan.priceAmount, currency);
}

export function formatPlanMonthlyPrice(planId: PlanId, currency: CurrencyCode): string {
  const amount = PLAN_MONTHLY_AMOUNTS[planId];
  if (amount === null) {
    return 'Custom';
  }
  return formatPrice(amount, currency);
}

const featureComparisonRows: { label: string; values: Record<PlanId, string | boolean> }[] = [
  { label: 'Locations', values: { free: '1', starter: '3', pro: 'Unlimited', enterprise: 'Custom' } },
  { label: 'Orders / month', values: { free: '100', starter: '1,000', pro: '10,000', enterprise: 'Custom' } },
  { label: 'POS & KDS', values: { free: true, starter: true, pro: true, enterprise: true } },
  { label: 'Online storefront', values: { free: true, starter: true, pro: true, enterprise: true } },
  { label: 'Custom domain', values: { free: false, starter: true, pro: true, enterprise: true } },
  { label: 'Delivery & driver app', values: { free: false, starter: true, pro: true, enterprise: true } },
  { label: 'Customer app', values: { free: true, starter: true, pro: true, enterprise: true } },
  { label: 'Tenant branding', values: { free: true, starter: true, pro: true, enterprise: true } },
  { label: 'Staff & RBAC', values: { free: 'Basic', starter: true, pro: true, enterprise: true } },
  { label: 'Reports', values: { free: 'Basic', starter: true, pro: 'Advanced', enterprise: 'Advanced' } },
  { label: 'Priority support', values: { free: false, starter: false, pro: true, enterprise: true } },
];

export function getComparisonRows(currency: CurrencyCode = 'EUR') {
  const planIds: PlanId[] = ['free', 'starter', 'pro', 'enterprise'];
  const priceRow: { label: string; values: Record<PlanId, string | boolean> } = {
    label: 'Monthly price',
    values: Object.fromEntries(
      planIds.map((id) => [id, formatPlanMonthlyPrice(id, currency)]),
    ) as Record<PlanId, string | boolean>,
  };

  return [priceRow, ...featureComparisonRows];
}

export const pricingFaqs = [
  {
    q: 'Is the Free plan really free?',
    a: 'Yes. You get one location and up to 100 orders per month. Upgrade anytime from Admin → Billing.',
  },
  {
    q: 'What counts as an order?',
    a: 'Each completed order placed through POS or your online storefront within the billing period.',
  },
  {
    q: 'Are Stripe card processing fees included?',
    a: 'No. Ordella subscription covers the platform. Card processing follows Stripe’s standard rates.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade instantly. Downgrades are blocked if your current usage exceeds the target plan limits.',
  },
  {
    q: 'Do you offer a trial?',
    a: 'Starter and Pro include a 14-day trial when billing is connected to Stripe.',
  },
];
