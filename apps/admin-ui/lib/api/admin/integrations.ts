import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const providerSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  authType: z.string().default('api_key'),
  capabilities: z.array(z.string()).default([]),
  docsUrl: z.string().nullable().optional(),
  configSchema: z.record(z.unknown()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

const appSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  providerId: z.string().uuid(),
  providerSlug: z.string(),
  providerName: z.string(),
  providerCategory: z.string(),
  integrationType: z.string().default('other'),
  name: z.string(),
  status: z.string(),
  config: z.record(z.unknown()),
  syncSchedule: z.string().nullable().optional(),
  conflictResolution: z.string().default('provider_wins'),
  retryCount: z.number().default(0),
  lastSyncAt: z.string().nullable().optional(),
  lastSyncStatus: z.string().nullable().optional(),
  connectedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

const logSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationId: z.string().uuid(),
  level: z.string(),
  action: z.string(),
  message: z.string().nullable(),
  metadata: z.record(z.unknown()),
  requestPayload: z.record(z.unknown()).nullable().optional(),
  responsePayload: z.record(z.unknown()).nullable().optional(),
  errorCode: z.string().nullable().optional(),
  durationMs: z.number().nullable().optional(),
  createdAt: z.string(),
});

const eventSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string().uuid(),
  eventType: z.string(),
  externalId: z.string().nullable(),
  payload: z.record(z.unknown()),
  status: z.string(),
  processedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type IntegrationProvider = z.infer<typeof providerSchema>;
export type IntegrationApp = z.infer<typeof appSchema>;
export type IntegrationLog = z.infer<typeof logSchema>;
export type IntegrationEvent = z.infer<typeof eventSchema>;

export async function listIntegrationProviders(api: ApiClient) {
  return z.array(providerSchema).parse(await api.getData<unknown[]>('integration-providers'));
}

export async function listIntegrationApps(api: ApiClient) {
  return z.array(appSchema).parse(await api.getData<unknown[]>('integrations/apps'));
}

export async function installIntegration(api: ApiClient, body: {
  providerId: string;
  name: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  syncSchedule?: string;
  conflictResolution?: string;
}) {
  return appSchema.parse(await api.postData<unknown>('integrations/apps', body));
}

export async function updateIntegration(api: ApiClient, id: string, body: {
  status?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  syncSchedule?: string;
  conflictResolution?: string;
}) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`integrations/apps/${id}`, body);
  return appSchema.parse(data.data);
}

export async function uninstallIntegration(api: ApiClient, id: string) {
  await api.delete(`integrations/apps/${id}`);
}

export async function testIntegrationConnection(api: ApiClient, id: string) {
  return api.postData<{ ok: boolean; latencyMs: number; message: string }>(`integrations/apps/${id}/test-connection`);
}

export async function syncIntegrationNow(api: ApiClient, id: string, mode = 'manual') {
  return api.postData<{ queued: boolean; eventId: string; syncedObjects: string[] }>(`integrations/apps/${id}/sync`, { mode });
}

export async function listIntegrationLogs(api: ApiClient, params?: { integrationId?: string; level?: string }) {
  return z.array(logSchema).parse(await api.getData<unknown[]>('integration-logs', { params }));
}

export async function listIntegrationEvents(api: ApiClient, params?: { integrationId?: string }) {
  return z.array(eventSchema).parse(await api.getData<unknown[]>('integration-events', { params }));
}
