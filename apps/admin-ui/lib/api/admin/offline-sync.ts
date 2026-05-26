import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const edgeDeviceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  deviceFingerprint: z.string(),
  deviceType: z.string(),
  displayName: z.string(),
  status: z.string(),
  offlineTokenHash: z.string().nullable(),
  storageKeyFingerprint: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  capabilities: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const offlineSettingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  offlineModeEnabled: z.boolean(),
  allowPosSales: z.boolean(),
  allowWarehouseOps: z.boolean(),
  allowDeliveryOps: z.boolean(),
  allowKioskOrders: z.boolean(),
  requireDeviceBinding: z.boolean(),
  maxOfflineMinutes: z.number(),
  deltaRetentionDays: z.number(),
  policy: z.record(z.unknown()),
  updatedAt: z.string(),
});

const offlineLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid().nullable(),
  deviceId: z.string().uuid().nullable(),
  eventType: z.string(),
  level: z.string(),
  message: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

const offlineConflictSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  operationId: z.string().uuid(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  conflictType: z.string(),
  resolutionStrategy: z.string(),
  status: z.string(),
  clientPayload: z.record(z.unknown()),
  serverPayload: z.record(z.unknown()),
  resolutionOutcome: z.record(z.unknown()),
  resolvedByUserId: z.string().uuid().nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
});

const offlineDashboardSchema = z.object({
  pendingActions: z.number(),
  openConflicts: z.number(),
  failedAttempts: z.number(),
  devices: z.array(edgeDeviceSchema),
  recentLogs: z.array(offlineLogSchema),
});

const forceSyncSchema = z.object({
  processed: z.number(),
  syncedAt: z.string(),
});

export type EdgeDevice = z.infer<typeof edgeDeviceSchema>;
export type OfflineLocationSetting = z.infer<typeof offlineSettingSchema>;
export type OfflineSyncLog = z.infer<typeof offlineLogSchema>;
export type OfflineSyncConflict = z.infer<typeof offlineConflictSchema>;
export type OfflineSyncDashboard = z.infer<typeof offlineDashboardSchema>;

export async function getOfflineSyncDashboard(api: ApiClient) {
  return offlineDashboardSchema.parse(await api.getData<unknown>('offline-sync/dashboard'));
}

export async function listOfflineSettings(api: ApiClient) {
  return z.array(offlineSettingSchema).parse(await api.getData<unknown>('offline-sync/settings'));
}

export async function updateOfflineSetting(api: ApiClient, body: Omit<OfflineLocationSetting, 'id' | 'tenantId' | 'updatedAt'>) {
  return offlineSettingSchema.parse(await api.postData<unknown>('offline-sync/settings', body));
}

export async function listOfflineLogs(api: ApiClient, locationId?: string) {
  return z.array(offlineLogSchema).parse(await api.getData<unknown>('offline-sync/logs', { params: locationId ? { locationId } : undefined }));
}

export async function listOfflineConflicts(api: ApiClient, locationId?: string) {
  return z.array(offlineConflictSchema).parse(await api.getData<unknown>('offline-sync/conflicts', { params: locationId ? { locationId } : undefined }));
}

export async function resolveOfflineConflict(api: ApiClient, id: string, outcome: 'client_wins' | 'server_wins' | 'merged' | 'dismissed') {
  return offlineConflictSchema.parse(await api.postData<unknown>(`offline-sync/conflicts/${id}/resolve`, { outcome }));
}

export async function forceOfflineSync(api: ApiClient, locationId: string) {
  return forceSyncSchema.parse(await api.postData<unknown>('offline-sync/force-sync', { locationId }));
}
