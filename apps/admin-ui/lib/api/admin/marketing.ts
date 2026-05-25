import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const segmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  filters: z.record(z.unknown()),
  createdAt: z.string(),
});

export const campaignSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['email', 'sms']),
  segmentId: z.string().uuid(),
  segmentName: z.string().nullable().optional(),
  subject: z.string().nullable(),
  message: z.string(),
  scheduleAt: z.string().nullable(),
  status: z.string(),
  sentCount: z.number().optional(),
  failedCount: z.number().optional(),
  createdAt: z.string(),
});

export const marketingAnalyticsSchema = z.object({
  campaigns: z.number(),
  sent: z.number(),
  delivered: z.number(),
  failed: z.number(),
  clicks: z.number(),
  conversions: z.number(),
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

export async function listSegments(api: ApiClient) {
  const data = await api.getData<unknown[]>('segments/list');
  return z.array(segmentSchema).parse(data);
}

export async function createSegment(api: ApiClient, body: { name: string; filters: Record<string, unknown> }) {
  const data = await api.postData<unknown>('segments/create', body);
  return segmentSchema.parse(data);
}

export async function updateSegment(api: ApiClient, id: string, body: { name: string; filters: Record<string, unknown> }) {
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
  type: 'email' | 'sms';
  segmentId: string;
  subject?: string;
  message: string;
  scheduleAt?: string;
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
