import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const recommendationSettingsSchema = z.object({
  tenantId: z.string().uuid(),
  isEnabled: z.boolean(),
  personalizationEnabled: z.boolean(),
  cartUpsellsEnabled: z.boolean(),
  maxRecommendations: z.number().int(),
  enabledTypes: z.array(z.string()).default([]),
  rankingWeights: z.record(z.number()).default({}),
  personalizationRules: z.record(z.unknown()).default({}),
  updatedAt: z.string().nullable().optional(),
});

export const recommendationAnalyticsSchema = z.object({
  settings: recommendationSettingsSchema,
  impressions: z.number(),
  clicks: z.number(),
  addToCart: z.number(),
  purchases: z.number(),
  addToCartRate: z.number(),
  conversionRate: z.number(),
  revenueInfluenced: z.string(),
  aovUplift: z.string(),
  conversionUplift: z.string(),
  topRecommendedItems: z.array(
    z.object({
      itemId: z.string().uuid(),
      name: z.string(),
      events: z.number(),
    }),
  ),
});

export const searchAnalyticsSchema = z.object({
  queries: z.number(),
  clicks: z.number(),
  conversions: z.number(),
  clickThroughRate: z.number(),
  conversionRate: z.number(),
  topQueries: z.array(z.object({
    query: z.string(),
    count: z.number(),
    avgResults: z.number(),
  })),
});

export type RecommendationSettings = z.infer<typeof recommendationSettingsSchema>;
export type RecommendationAnalytics = z.infer<typeof recommendationAnalyticsSchema>;
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>;

export async function getRecommendationAnalytics(api: ApiClient) {
  const data = await api.getData<unknown>('recommendations/analytics');
  return recommendationAnalyticsSchema.parse(data);
}

export async function getRecommendationSettings(api: ApiClient) {
  const data = await api.getData<unknown>('recommendations/settings');
  return recommendationSettingsSchema.parse(data);
}

export async function getSearchAnalytics(api: ApiClient) {
  const data = await api.getData<unknown>('search/analytics');
  return searchAnalyticsSchema.parse(data);
}

export async function updateRecommendationSettings(
  api: ApiClient,
  body: Partial<Pick<RecommendationSettings, 'isEnabled' | 'personalizationEnabled' | 'cartUpsellsEnabled' | 'maxRecommendations' | 'enabledTypes' | 'rankingWeights' | 'personalizationRules'>>,
) {
  const data = await api.postData<unknown>('recommendations/settings', body);
  return recommendationSettingsSchema.parse(data);
}
