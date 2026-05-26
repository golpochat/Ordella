import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const crmCustomerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  pointsBalance: z.number(),
  storeCreditBalance: z.string(),
  lifetimeValue: z.string(),
  totalOrders: z.number(),
  avgOrderValue: z.string(),
  firstOrderAt: z.string().nullable(),
  lastOrderAt: z.string().nullable(),
  preferredLocationId: z.string().uuid().nullable(),
  tags: z.array(z.string()).default([]),
  segments: z.array(z.string()).default([]),
  staffNotes: z.string().nullable(),
  defaultAddressId: z.string().uuid().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  preferences: z.record(z.unknown()).optional(),
  notificationEmailOptIn: z.boolean().optional(),
  notificationSmsOptIn: z.boolean().optional(),
  notificationPushOptIn: z.boolean().optional(),
  marketingEmailOptIn: z.boolean().optional(),
  marketingSmsOptIn: z.boolean().optional(),
  marketingPushOptIn: z.boolean().optional(),
  gdprErasedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

const crmOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  orderType: z.string(),
  status: z.string(),
  total: z.string(),
  createdAt: z.string(),
});

const customerInsightSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  tenantId: z.string().uuid(),
  metrics: z.record(z.unknown()),
  categoriesPurchased: z.array(z.string()),
  orderFrequency: z.string(),
  churnRiskScore: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const crmCustomerDetailSchema = crmCustomerSchema.extend({
  orders: z.array(crmOrderSchema).default([]),
  insight: customerInsightSchema.nullable(),
  loyaltyTransactions: z.array(z.unknown()).default([]),
  giftCards: z.array(z.unknown()).default([]),
  storeCreditTransactions: z.array(z.unknown()).default([]),
  addresses: z.array(z.unknown()).default([]),
  savedBaskets: z.array(z.unknown()).default([]),
  savedItems: z.array(z.unknown()).default([]),
  accountStatus: z.string().optional(),
});

const segmentSummarySchema = z.object({
  name: z.string(),
  customerCount: z.number(),
});

export const crmInsightsSchema = z.object({
  totalCustomers: z.number(),
  newCustomersLast30Days: z.number(),
  returningCustomers: z.number(),
  repeatOrderRate: z.number(),
  averageLifetimeValue: z.string(),
  churnRiskCustomers: z.number(),
  topCustomers: z.array(crmCustomerSchema),
  atRiskCustomers: z.array(crmCustomerSchema),
  highValueCustomers: z.array(crmCustomerSchema),
  inactiveCustomers: z.array(crmCustomerSchema),
  customerGrowth: z.array(z.object({ month: z.string(), count: z.number() })),
  valueDistribution: z.array(z.object({ label: z.string(), count: z.number() })),
  orderFrequencyDistribution: z.array(z.object({ label: z.string(), count: z.number() })),
  segmentPerformance: z.array(segmentSummarySchema),
});

export type CrmCustomer = z.infer<typeof crmCustomerSchema>;
export type CrmCustomerDetail = z.infer<typeof crmCustomerDetailSchema>;
export type CrmInsights = z.infer<typeof crmInsightsSchema>;
export type CrmSegmentSummary = z.infer<typeof segmentSummarySchema>;

export async function fetchCrmCustomers(api: ApiClient, params?: { q?: string; segment?: string; tag?: string }) {
  const data = await api.getData<unknown[]>('crm/customers', { params });
  return z.array(crmCustomerSchema).parse(data);
}

export async function fetchCrmCustomer(api: ApiClient, id: string) {
  const data = await api.getData<unknown>(`crm/customers/${id}`);
  return crmCustomerDetailSchema.parse(data);
}

export async function fetchCrmSegments(api: ApiClient) {
  const data = await api.getData<unknown[]>('crm/segments');
  return z.array(segmentSummarySchema).parse(data);
}

export async function fetchCrmInsights(api: ApiClient) {
  const data = await api.getData<unknown>('crm/insights');
  return crmInsightsSchema.parse(data);
}

export async function updateCrmCustomerTags(api: ApiClient, body: {
  customerId: string;
  tags?: string[];
  addTags?: string[];
  removeTags?: string[];
  notes?: string;
}) {
  const data = await api.postData<unknown>('crm/customers/tag', body);
  return crmCustomerSchema.parse(data);
}

export async function refreshCrmInsights(api: ApiClient, customerId?: string) {
  return api.postData<{ updated: number }>('crm/customers/update-insights', { customerId });
}
