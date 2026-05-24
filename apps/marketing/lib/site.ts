export const siteConfig = {
  name: 'Ordella',
  tagline: 'Run every order channel from one platform.',
  description:
    'Ordella unifies in-store POS, online ordering, kitchen displays, delivery, and customer apps for multi-location restaurants.',
  url: process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3006',
  ogImage: '/og-default.svg',
  themeColor: '#3A6DFF',
  themeColorDark: '#0F1A2A',
  backgroundColor: '#F4F6F8',
  backgroundColorDark: '#0F1A2A',
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
