import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const deviceSchema = z.object({
  id: z.string().uuid(),
  deviceId: z.string(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  deviceType: z.string(),
  displayName: z.string(),
  status: z.string(),
  lastHeartbeatAt: z.string().nullable(),
  firmwareVersion: z.string().nullable(),
  authToken: z.string().optional(),
  supportsEncryption: z.boolean(),
  config: z.record(z.unknown()),
  capabilities: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const logSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  devicePk: z.string().uuid(),
  deviceId: z.string(),
  level: z.string(),
  action: z.string(),
  message: z.string().nullable(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

const commandSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  devicePk: z.string().uuid(),
  deviceId: z.string(),
  commandType: z.string(),
  payload: z.record(z.unknown()),
  status: z.string(),
  responsePayload: z.record(z.unknown()).nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  sentAt: z.string().nullable(),
  acknowledgedAt: z.string().nullable(),
});

const summarySchema = z.object({
  total: z.number(),
  online: z.number(),
  offline: z.number(),
  error: z.number(),
  byType: z.record(z.number()),
});

export type HardwareDevice = z.infer<typeof deviceSchema>;
export type HardwareDeviceLog = z.infer<typeof logSchema>;
export type HardwareDeviceCommand = z.infer<typeof commandSchema>;
export type HardwareSummary = z.infer<typeof summarySchema>;

export async function listHardwareDevices(api: ApiClient, params?: { locationId?: string; deviceType?: string; status?: string }) {
  return z.array(deviceSchema).parse(await api.getData<unknown[]>('hardware/devices', { params }));
}

export async function fetchHardwareSummary(api: ApiClient) {
  return summarySchema.parse(await api.getData<unknown>('hardware/devices/summary'));
}

export async function registerHardwareDevice(api: ApiClient, body: {
  deviceId: string;
  locationId: string;
  deviceType: string;
  displayName: string;
  firmwareVersion?: string;
  supportsEncryption?: boolean;
  config?: Record<string, unknown>;
}) {
  return deviceSchema.parse(await api.postData<unknown>('hardware/devices', body));
}

export async function updateHardwareDevice(api: ApiClient, id: string, body: {
  locationId?: string;
  displayName?: string;
  status?: string;
  firmwareVersion?: string;
  config?: Record<string, unknown>;
}) {
  const data = await api.patch<{ success: boolean; data: unknown }>(`hardware/devices/${id}`, body);
  return deviceSchema.parse(data.data);
}

export async function listHardwareDeviceLogs(api: ApiClient, id: string) {
  return z.array(logSchema).parse(await api.getData<unknown[]>(`hardware/devices/${id}/logs`));
}

export async function dispatchHardwareCommand(api: ApiClient, id: string, body: { commandType: string; payload?: Record<string, unknown> }) {
  return commandSchema.parse(await api.postData<unknown>(`hardware/devices/${id}/commands`, body));
}
