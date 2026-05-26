import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  locationId: z.string().uuid().nullable(),
  actorType: z.string().default('system'),
  source: z.string().default('api'),
  status: z.string().default('success'),
  riskLevel: z.string().default('low'),
  requestId: z.string().nullable().optional(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  metadata: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  previousHash: z.string().nullable().optional(),
  hash: z.string().nullable().optional(),
  retentionUntil: z.string().nullable().optional(),
  legalHold: z.boolean().optional(),
  createdAt: z.string(),
});

const auditLogListSchema = z.object({
  logs: z.array(auditLogSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditLogList = z.infer<typeof auditLogListSchema>;

export async function listAuditLogs(
  api: ApiClient,
  params?: {
    from?: string;
    to?: string;
    userId?: string;
    locationId?: string;
    entityType?: string;
    action?: string;
    actorType?: string;
    source?: string;
    status?: string;
    riskLevel?: string;
    page?: number;
    limit?: number;
  },
) {
  const data = await api.getData<unknown>('audit/logs', { params });
  return auditLogListSchema.parse(data);
}

export async function exportAuditLogsCsv(api: ApiClient, params?: Parameters<typeof listAuditLogs>[1]) {
  return api.get<string>('audit/logs/export.csv', { params });
}

export async function listSecurityEvents(api: ApiClient, params?: Parameters<typeof listAuditLogs>[1]) {
  const data = await api.getData<unknown>('audit/logs/security/events', { params });
  return auditLogListSchema.parse(data);
}

export async function listAuditAlerts(api: ApiClient) {
  return api.getData<unknown[]>('audit/logs/security/alerts');
}

export async function fetchComplianceStatus(api: ApiClient) {
  return api.getData<unknown>('audit/logs/compliance/status');
}

export async function getAuditLog(api: ApiClient, id: string) {
  const data = await api.getData<unknown>(`audit/logs/${id}`);
  return auditLogSchema.parse(data);
}
