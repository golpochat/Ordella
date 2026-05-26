import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const apiKeySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  keyPrefix: z.string(),
  scopes: z.array(z.string()),
  key: z.string().optional(),
  rateLimitPerMinute: z.number(),
  ipAllowlist: z.array(z.string()),
  isActive: z.boolean(),
  expiresAt: z.string().nullable().optional(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
});

const webhookSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  url: z.string(),
  secret: z.string().optional(),
  events: z.array(z.string()),
  isActive: z.boolean(),
  lastDeliveryAt: z.string().nullable(),
  createdAt: z.string(),
});

const webhookLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  webhookId: z.string().uuid(),
  eventType: z.string(),
  attempt: z.number(),
  statusCode: z.number().nullable(),
  responseBody: z.string().nullable(),
  success: z.boolean(),
  createdAt: z.string(),
});

const integrationProviderSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  configSchema: z.record(z.unknown()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

const integrationAppSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  providerId: z.string().uuid(),
  providerSlug: z.string(),
  providerName: z.string(),
  providerCategory: z.string(),
  name: z.string(),
  status: z.string(),
  config: z.record(z.unknown()),
  connectedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
});

export type DeveloperApiKey = z.infer<typeof apiKeySchema>;
export type DeveloperWebhook = z.infer<typeof webhookSchema>;
export type DeveloperWebhookLog = z.infer<typeof webhookLogSchema>;
export type DeveloperIntegrationProvider = z.infer<typeof integrationProviderSchema>;
export type DeveloperIntegrationApp = z.infer<typeof integrationAppSchema>;

export async function listApiKeys(api: ApiClient) {
  const data = await api.getData<unknown[]>('api-keys');
  return z.array(apiKeySchema).parse(data);
}

export async function createApiKey(api: ApiClient, body: { name: string; scopes: string[]; rateLimitPerMinute?: number; ipAllowlist?: string[] }) {
  const data = await api.postData<unknown>('api-keys', body);
  return apiKeySchema.parse(data);
}

export async function listApiKeyScopes(api: ApiClient) {
  return z.array(z.string()).parse(await api.getData<unknown[]>('api-keys/scopes'));
}

export async function listApiKeyUsage(api: ApiClient, id: string) {
  return api.getData<unknown[]>(`api-keys/${id}/usage`);
}

export async function revokeApiKey(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`api-keys/${id}/revoke`);
  return apiKeySchema.parse(data);
}

export async function rotateApiKey(api: ApiClient, id: string) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`api-keys/${id}/rotate`, {});
  return apiKeySchema.parse(data.data);
}

export async function listWebhooks(api: ApiClient) {
  const data = await api.getData<unknown[]>('webhooks');
  return z.array(webhookSchema).parse(data);
}

export async function createWebhook(api: ApiClient, body: { url: string; events: string[] }) {
  const data = await api.postData<unknown>('webhooks', body);
  return webhookSchema.parse(data);
}

export async function disableWebhook(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`webhooks/${id}/disable`);
  return webhookSchema.parse(data);
}

export async function rotateWebhookSecret(api: ApiClient, id: string) {
  const data = await api.postData<unknown>(`webhooks/${id}/rotate-secret`);
  return webhookSchema.parse(data);
}

export async function testWebhook(api: ApiClient, id: string, eventType = 'order.created') {
  return api.postData<{ delivered: boolean }>(`webhooks/${id}/test`, { eventType });
}

export async function listWebhookLogs(api: ApiClient) {
  const data = await api.getData<unknown[]>('webhooks/logs');
  return z.array(webhookLogSchema).parse(data);
}

export async function listIntegrationProviders(api: ApiClient) {
  const data = await api.getData<unknown[]>('integration-providers');
  return z.array(integrationProviderSchema).parse(data);
}

export async function listIntegrationApps(api: ApiClient) {
  const data = await api.getData<unknown[]>('integrations/apps');
  return z.array(integrationAppSchema).parse(data);
}

export async function installIntegrationApp(api: ApiClient, body: { providerId: string; name: string; config?: Record<string, unknown> }) {
  const data = await api.postData<unknown>('integrations/apps', body);
  return integrationAppSchema.parse(data);
}

export async function updateIntegrationApp(api: ApiClient, id: string, body: { status?: string; config?: Record<string, unknown> }) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`integrations/apps/${id}`, body);
  return integrationAppSchema.parse(data.data);
}

export async function uninstallIntegrationApp(api: ApiClient, id: string) {
  await api.delete(`integrations/apps/${id}`);
}

export async function fetchDeveloperDocs(api: ApiClient) {
  return api.getData<Record<string, unknown>>('developer/docs');
}
