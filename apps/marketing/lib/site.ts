export const siteConfig = {
  name: 'Ordella',
  tagline: 'Run every retail order channel from one platform.',
  description:
    'POS, online ordering, inventory, fulfillment, delivery, and multi-location management for restaurants, cafés, takeaways, grocery, butchers, and retail businesses.',
  url: process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3006',
  ogImage: '/og-default.svg',
  themeColor: 'hsl(224 100% 61%)',
  themeColorDark: 'hsl(213 47% 11%)',
  backgroundColor: 'hsl(210 20% 96%)',
  backgroundColorDark: 'hsl(213 47% 11%)',
  manifestPath: '/manifest.json',
};

import { buildSignupUrl as buildSignupUrlImpl, type UtmCampaign } from './signup-url';

export {
  buildSignupUrl,
  buildMarketingSignupPath,
  getSignupBaseUrl,
  type SignupPlan,
  type SignupUrlOptions,
  type UtmCampaign,
} from './signup-url';

/** @deprecated Use {@link buildSignupUrl} */
export function appSignupUrl(
  plan = 'free',
  utmContent?: string,
  campaign: UtmCampaign = 'landing',
): string {
  return buildSignupUrlImpl({ plan, campaign, content: utmContent });
}

export function adminLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_ADMIN_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  return new URL('/login', base).toString();
}
