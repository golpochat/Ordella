import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const segmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  filters: z.record(z.unknown()),
  builderType: z.enum(['rfm', 'ltv', 'churn', 'behavior', 'custom']).default('custom'),
  ruleSummary: z.array(z.record(z.unknown())).default([]),
  createdAt: z.string(),
});

export const campaignSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['email', 'sms', 'push']),
  campaignType: z.enum(['broadcast', 'trigger-based', 'journey']).default('broadcast'),
  channels: z.array(z.enum(['email', 'sms', 'push'])).default([]),
  segmentId: z.string().uuid(),
  segmentName: z.string().nullable().optional(),
  subject: z.string().nullable(),
  message: z.string(),
  scheduleAt: z.string().nullable(),
  scheduleType: z.enum(['one-time', 'recurring']).default('one-time'),
  recurrenceRule: z.string().nullable().optional(),
  status: z.string(),
  campaignCategory: z.string().nullable().optional(),
  frequencyCap: z.number().optional(),
  safetyRules: z.record(z.unknown()).optional(),
  sentCount: z.number().optional(),
  failedCount: z.number().optional(),
  openCount: z.number().optional(),
  clickCount: z.number().optional(),
  conversionCount: z.number().optional(),
  revenueAttribution: z.string().optional(),
  unsubscribeRate: z.number().optional(),
  createdAt: z.string(),
});

export const marketingAnalyticsSchema = z.object({
  campaigns: z.number(),
  sent: z.number(),
  delivered: z.number(),
  failed: z.number(),
  opens: z.number().optional(),
  clicks: z.number(),
  conversions: z.number(),
  revenueAttribution: z.string().optional(),
  unsubscribeRate: z.number().optional(),
});

export const journeySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  trigger: z.string(),
  targetSegmentId: z.string().uuid().nullable(),
  status: z.string(),
  channels: z.array(z.string()).default([]),
  frequencyCap: z.number(),
  steps: z.array(z.record(z.unknown())).default([]),
  safetyRules: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
});

const customerPreviewSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  pointsBalance: z.number(),
  lifetimeValue: z.string(),
  lastOrderAt: z.string().nullable(),
});

export type MarketingSegment = z.infer<typeof segmentSchema>;
export type MarketingCampaign = z.infer<typeof campaignSchema>;
export type MarketingAnalytics = z.infer<typeof marketingAnalyticsSchema>;
export type MarketingPreviewCustomer = z.infer<typeof customerPreviewSchema>;
export type MarketingJourney = z.infer<typeof journeySchema>;

export async function listSegments(api: ApiClient) {
  const data = await api.getData<unknown[]>('segments/list');
  return z.array(segmentSchema).parse(data);
}

export async function createSegment(api: ApiClient, body: {
  name: string;
  filters: Record<string, unknown>;
  builderType?: MarketingSegment['builderType'];
  ruleSummary?: Array<Record<string, unknown>>;
}) {
  const data = await api.postData<unknown>('segments/create', body);
  return segmentSchema.parse(data);
}

export async function updateSegment(api: ApiClient, id: string, body: {
  name: string;
  filters: Record<string, unknown>;
  builderType?: MarketingSegment['builderType'];
  ruleSummary?: Array<Record<string, unknown>>;
}) {
  const data = await api.postData<unknown>(`segments/update/${id}`, body);
  return segmentSchema.parse(data);
}

export async function deleteSegment(api: ApiClient, id: string) {
  return api.postData<{ deleted: boolean }>(`segments/delete/${id}`);
}

export async function previewSegment(api: ApiClient, id: string) {
  const data = await api.postData<unknown[]>(`segments/${id}/preview`);
  return z.array(customerPreviewSchema).parse(data);
}

export async function listCampaigns(api: ApiClient) {
  const data = await api.getData<unknown[]>('campaigns/list');
  return z.array(campaignSchema).parse(data);
}

export async function getCampaign(api: ApiClient, id: string) {
  const data = await api.getData<unknown>(`campaigns/${id}`);
  return campaignSchema.parse(data);
}

export async function createCampaign(api: ApiClient, body: {
  name: string;
  type: 'email' | 'sms' | 'push';
  campaignType?: 'broadcast' | 'trigger-based' | 'journey';
  channels?: Array<'email' | 'sms' | 'push'>;
  segmentId: string;
  subject?: string;
  message: string;
  scheduleAt?: string;
  scheduleType?: 'one-time' | 'recurring';
  recurrenceRule?: string;
  status?: string;
  campaignCategory?: string;
  frequencyCap?: number;
  safetyRules?: Record<string, unknown>;
}) {
  const data = await api.postData<unknown>('campaigns/create', body);
  return campaignSchema.parse(data);
}

export async function updateCampaign(api: ApiClient, id: string, body: Parameters<typeof createCampaign>[1]) {
  const data = await api.postData<unknown>(`campaigns/update/${id}`, body);
  return campaignSchema.parse(data);
}

export async function deleteCampaign(api: ApiClient, id: string) {
  return api.postData<{ deleted: boolean }>(`campaigns/delete/${id}`);
}

export async function duplicateCampaign(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`campaigns/${id}/duplicate`);
  return campaignSchema.parse(data);
}

export async function sendCampaignNow(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`campaigns/send-now/${id}`);
  return campaignSchema.parse(data);
}

export async function fetchMarketingAnalytics(api: ApiClient) {
  const data = await api.getData<unknown>('campaigns/analytics');
  return marketingAnalyticsSchema.parse(data);
}

export async function listJourneys(api: ApiClient) {
  const data = await api.getData<unknown[]>('campaigns/journeys');
  return z.array(journeySchema).parse(data);
}

export async function upsertJourney(api: ApiClient, body: {
  id?: string;
  name: string;
  trigger: string;
  targetSegmentId?: string;
  status?: string;
  channels: string[];
  frequencyCap?: number;
  steps: Array<Record<string, unknown>>;
  safetyRules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  const data = await api.postData<unknown>('campaigns/journeys', body);
  return journeySchema.parse(data);
}
