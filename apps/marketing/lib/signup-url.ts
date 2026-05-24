/**
 * Primary signup entry: admin app login (or NEXT_PUBLIC_SIGNUP_PATH).
 * Query params are forwarded for attribution; admin login persists them to sessionStorage.
 */

export const SIGNUP_PLANS = ['free', 'starter', 'pro', 'enterprise'] as const;
export type SignupPlan = (typeof SIGNUP_PLANS)[number];

export const UTM_CAMPAIGNS = ['landing', 'pricing', 'blog', 'features', 'docs', 'signup'] as const;
export type UtmCampaign = (typeof UTM_CAMPAIGNS)[number];

export type SignupUrlOptions = {
  plan?: SignupPlan | string;
  campaign?: UtmCampaign | string;
  content?: string;
};

const UTM_SOURCE = 'marketing';
const UTM_MEDIUM = 'web';

export function normalizeSignupPlan(plan: string | undefined): SignupPlan {
  if (plan && SIGNUP_PLANS.includes(plan as SignupPlan)) {
    return plan as SignupPlan;
  }
  return 'free';
}

export function normalizeUtmCampaign(campaign: string | undefined): UtmCampaign {
  if (campaign && UTM_CAMPAIGNS.includes(campaign as UtmCampaign)) {
    return campaign as UtmCampaign;
  }
  return 'landing';
}

export function getSignupBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const path = process.env.NEXT_PUBLIC_SIGNUP_PATH ?? '/login';
  return new URL(path, base).toString();
}

/** Absolute URL to the admin signup/login entry with plan and UTM params. */
export function buildSignupUrl(options: SignupUrlOptions = {}): string {
  const plan = normalizeSignupPlan(options.plan);
  const campaign = normalizeUtmCampaign(options.campaign);
  const url = new URL(getSignupBaseUrl());

  url.searchParams.set('plan', plan);
  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', UTM_MEDIUM);
  url.searchParams.set('utm_campaign', campaign);

  if (options.content) {
    url.searchParams.set('utm_content', options.content);
  }

  return url.toString();
}

/** On-site redirect route that forwards query params to the admin signup URL. */
export function buildMarketingSignupPath(options: SignupUrlOptions = {}): string {
  const plan = normalizeSignupPlan(options.plan);
  const campaign = normalizeUtmCampaign(options.campaign);
  const params = new URLSearchParams();

  params.set('plan', plan);
  params.set('utm_source', UTM_SOURCE);
  params.set('utm_medium', UTM_MEDIUM);
  params.set('utm_campaign', campaign);

  if (options.content) {
    params.set('utm_content', options.content);
  }

  return `/signup?${params.toString()}`;
}

export function utmCampaignFromPathname(pathname: string): UtmCampaign {
  if (pathname.startsWith('/pricing')) return 'pricing';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/features')) return 'features';
  if (pathname.startsWith('/docs')) return 'docs';
  return 'landing';
}
