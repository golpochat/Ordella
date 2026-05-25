import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  locationId: z.string().uuid().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  metadata: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
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
    page?: number;
    limit?: number;
  },
) {
  const data = await api.getData<unknown>('audit/logs', { params });
  return auditLogListSchema.parse(data);
}

export async function getAuditLog(api: ApiClient, id: string) {
  const data = await api.getData<unknown>(`audit/logs/${id}`);
  return auditLogSchema.parse(data);
}
