import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export type AnalyticsInsightsParams = {
  from?: string;
  to?: string;
  locationId?: string;
};

const insightSettingsSchema = z.object({
  tenantId: z.string().uuid(),
  segmentationRules: z.record(z.unknown()),
  ltvParameters: z.record(z.unknown()),
  churnThresholds: z.record(z.unknown()),
  updatedAt: z.string().nullable().optional(),
});

const metricSchema = z.object({
  customers: z.number(),
  averageLtv: z.string(),
  criticalChurnCustomers: z.number(),
  highChurnCustomers: z.number(),
  affinityPairs: z.number(),
  marketingSegments: z.number(),
});

const affinitySchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  relatedProductId: z.string().uuid(),
  relatedProductName: z.string(),
  orderCount: z.number(),
  support: z.number(),
  confidence: z.number(),
  lift: z.number(),
  affinityScore: z.number(),
});

const customerSummarySchema = z.object({
  customerId: z.string().uuid(),
  name: z.string(),
  lifetimeValue: z.string(),
  predictedLtv: z.string(),
  totalOrders: z.number(),
  churnRisk: z.number(),
  churnBand: z.string(),
});

const cohortMonthSchema = z.object({
  month: z.number(),
  customers: z.number().optional(),
  retentionRate: z.number().optional(),
  revenue: z.string().optional(),
  ordersPerCustomer: z.number().optional(),
});

export const analyticsInsightsDashboardSchema = z.object({
  generatedAt: z.string(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  settings: insightSettingsSchema,
  metrics: metricSchema,
  basketAnalysis: z.object({
    affinities: z.array(affinitySchema),
    network: z.object({
      nodes: z.array(z.object({ id: z.string(), label: z.string() })),
      edges: z.array(z.object({ source: z.string(), target: z.string(), weight: z.number() })),
    }),
  }),
  segmentation: z.object({
    segments: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      customerCount: z.number(),
      rules: z.record(z.unknown()),
      metrics: z.record(z.unknown()),
    })),
    clusters: z.array(z.object({
      customerId: z.string().uuid(),
      customerName: z.string(),
      x: z.number(),
      y: z.number(),
      size: z.number(),
      segment: z.string(),
    })),
    marketingAudiences: z.array(z.object({ id: z.string().uuid(), name: z.string(), filters: z.record(z.unknown()) })),
  }),
  ltv: z.object({
    distribution: z.array(z.object({ label: z.string(), count: z.number() })),
    topCustomers: z.array(customerSummarySchema),
  }),
  churn: z.object({
    funnel: z.array(z.object({ band: z.string(), count: z.number() })),
    atRiskCustomers: z.array(customerSummarySchema),
  }),
  cohorts: z.object({
    heatmap: z.array(z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) })),
    revenue: z.array(z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) })),
    orderFrequency: z.array(z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) })),
  }),
  recommendationSignals: z.array(z.object({ eventType: z.string(), count: z.number() })),
});

export const productInsightSchema = z.object({
  product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    sku: z.string().nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
  }),
  affinities: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    affinityScore: z.number(),
    confidence: z.number(),
    lift: z.number(),
    orderCount: z.number(),
  })),
});

export const customerInsightSchema = z.object({
  customer: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    segments: z.array(z.string()).default([]),
    lifetimeValue: z.string(),
    totalOrders: z.number(),
  }),
  insight: z.unknown().nullable().optional(),
  ltvTrend: z.array(z.object({ date: z.string(), lifetimeValue: z.string(), predictedLtv: z.string() })),
  churnTrend: z.array(z.object({ date: z.string(), riskScore: z.number(), riskBand: z.string(), factors: z.record(z.unknown()) })),
  recentOrders: z.array(z.object({
    id: z.string().uuid(),
    orderNumber: z.string().nullable(),
    total: z.string(),
    status: z.string(),
    createdAt: z.string(),
  })),
});

export const cohortInsightSchema = z.object({
  cohort: z.string(),
  retention: z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) }),
  revenue: z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) }).optional(),
  orderFrequency: z.object({ cohort: z.string(), months: z.array(cohortMonthSchema) }).optional(),
});

export type AnalyticsInsightsDashboard = z.infer<typeof analyticsInsightsDashboardSchema>;
export type AnalyticsInsightSettings = z.infer<typeof insightSettingsSchema>;
export type ProductInsight = z.infer<typeof productInsightSchema>;
export type CustomerInsight = z.infer<typeof customerInsightSchema>;
export type CohortInsight = z.infer<typeof cohortInsightSchema>;

export async function getAnalyticsInsightsDashboard(api: ApiClient, params?: AnalyticsInsightsParams) {
  const data = await api.getData<unknown>('analytics-insights/dashboard', { params });
  return analyticsInsightsDashboardSchema.parse(data);
}

export async function refreshAnalyticsInsights(api: ApiClient) {
  return api.postData<unknown>('analytics-insights/refresh', {});
}

export async function getAnalyticsInsightSettings(api: ApiClient) {
  const data = await api.getData<unknown>('analytics-insights/settings');
  return insightSettingsSchema.parse(data);
}

export async function updateAnalyticsInsightSettings(
  api: ApiClient,
  body: Partial<Pick<AnalyticsInsightSettings, 'segmentationRules' | 'ltvParameters' | 'churnThresholds'>>,
) {
  const data = await api.postData<unknown>('analytics-insights/settings', body);
  return insightSettingsSchema.parse(data);
}

export async function getProductInsight(api: ApiClient, productId: string) {
  const data = await api.getData<unknown>(`analytics-insights/products/${productId}`);
  return productInsightSchema.parse(data);
}

export async function getCustomerInsight(api: ApiClient, customerId: string) {
  const data = await api.getData<unknown>(`analytics-insights/customers/${customerId}`);
  return customerInsightSchema.parse(data);
}

export async function getCohortInsight(api: ApiClient, cohort: string, params?: AnalyticsInsightsParams) {
  const data = await api.getData<unknown>(`analytics-insights/cohorts/${cohort}`, { params });
  return cohortInsightSchema.parse(data);
}
