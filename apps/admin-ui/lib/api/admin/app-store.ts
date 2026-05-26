import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const installationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  appId: z.string().uuid(),
  status: z.string(),
  grantedScopes: z.array(z.string()),
  webhookEvents: z.array(z.string()),
  apiKeyId: z.string().uuid().nullable(),
  webhookId: z.string().uuid().nullable(),
  oauthClientId: z.string().nullable(),
  rateLimitPerMinute: z.number(),
  billingStatus: z.string(),
  usageCounters: z.record(z.number()).default({}),
  consentSnapshot: z.record(z.unknown()).default({}),
  installedAt: z.string(),
  uninstalledAt: z.string().nullable(),
});

const appSchema = z.object({
  id: z.string().uuid(),
  partnerId: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  provider: z.string(),
  category: z.string(),
  pricingModel: z.string(),
  priceCents: z.number(),
  usageUnit: z.string().nullable(),
  revenueShareBps: z.number(),
  status: z.string(),
  requestedScopes: z.array(z.string()),
  webhookEvents: z.array(z.string()),
  rateLimitPerMinute: z.number(),
  iconUrl: z.string().nullable(),
  screenshots: z.array(z.string()),
  docsUrl: z.string().nullable(),
  oauthClientId: z.string().nullable(),
  averageRating: z.number(),
  reviewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  installation: installationSchema.nullable().optional(),
});

const reviewSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  appId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  rating: z.number(),
  comment: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
});

const partnerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  companyName: z.string(),
  contactName: z.string(),
  email: z.string(),
  status: z.string(),
  sandboxEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const versionSchema = z.object({
  id: z.string().uuid(),
  appId: z.string().uuid(),
  version: z.string(),
  changelog: z.string().nullable(),
  manifest: z.record(z.unknown()),
  status: z.string(),
  createdAt: z.string(),
});

const appDetailsSchema = appSchema.extend({
  versions: z.array(versionSchema),
  reviews: z.array(reviewSchema),
  installation: installationSchema.nullable(),
});

const analyticsSchema = z.object({
  topApps: z.array(z.record(z.unknown())),
  installTrends: z.array(z.record(z.unknown())),
  revenuePerApp: z.array(z.record(z.unknown())),
  partnerEarningsCents: z.number(),
  reviewCount: z.number(),
});

const partnerDashboardSchema = z.object({
  partner: partnerSchema.nullable(),
  apps: z.array(appSchema),
  installs: z.number(),
  revenueCents: z.number(),
  reviews: z.number(),
});

export type MarketplaceApp = z.infer<typeof appSchema>;
export type MarketplaceAppDetails = z.infer<typeof appDetailsSchema>;
export type AppInstallation = z.infer<typeof installationSchema>;
export type AppReview = z.infer<typeof reviewSchema>;
export type AppPartner = z.infer<typeof partnerSchema>;
export type AppStoreAnalytics = z.infer<typeof analyticsSchema>;
export type PartnerDashboard = z.infer<typeof partnerDashboardSchema>;

export async function listMarketplaceApps(api: ApiClient, params?: { search?: string; category?: string }) {
  return z.array(appSchema).parse(await api.getData<unknown[]>('app-store/apps', { params }));
}

export async function fetchMarketplaceApp(api: ApiClient, id: string) {
  return appDetailsSchema.parse(await api.getData<unknown>(`app-store/apps/${id}`));
}

export async function installMarketplaceApp(api: ApiClient, id: string, body: { grantedScopes: string[]; webhookEvents: string[]; webhookUrl?: string }) {
  return api.postData<{ installation: AppInstallation; apiKey?: string; webhookSecret?: string }>(`app-store/apps/${id}/install`, body);
}

export async function uninstallMarketplaceApp(api: ApiClient, installationId: string) {
  await api.delete(`app-store/installations/${installationId}`);
}

export async function createAppReview(api: ApiClient, appId: string, body: { rating: number; comment?: string }) {
  return reviewSchema.parse(await api.postData<unknown>(`app-store/apps/${appId}/reviews`, body));
}

export async function registerAppPartner(api: ApiClient, body: { companyName: string; contactName: string; email: string }) {
  return partnerSchema.parse(await api.postData<unknown>('app-store/partners/register', body));
}

export async function submitMarketplaceApp(api: ApiClient, body: {
  partnerId?: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  pricingModel: string;
  priceCents?: number;
  usageUnit?: string;
  revenueShareBps?: number;
  requestedScopes?: string[];
  webhookEvents?: string[];
  docsUrl?: string;
}) {
  return api.postData<MarketplaceApp & { clientSecret?: string }>('app-store/apps/submit', body);
}

export async function approveMarketplaceApp(api: ApiClient, id: string, status: string) {
  return appSchema.parse(await api.patch<{ success: boolean; data: unknown }>(`app-store/apps/${id}/approval`, { status }).then((res) => res.data));
}

export async function meterAppUsage(api: ApiClient, installationId: string, body: { metric: string; quantity: number }) {
  return api.postData<unknown>(`app-store/installations/${installationId}/usage`, body);
}

export async function fetchAppStoreAnalytics(api: ApiClient) {
  return analyticsSchema.parse(await api.getData<unknown>('app-store/analytics'));
}

export async function fetchPartnerDashboard(api: ApiClient) {
  return partnerDashboardSchema.parse(await api.getData<unknown>('app-store/partner-dashboard'));
}
