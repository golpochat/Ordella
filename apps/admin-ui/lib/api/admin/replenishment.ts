import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const replenishmentRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid(),
  itemId: z.string().uuid(),
  ruleType: z.enum(['min_max', 'forecast_based', 'safety_stock']),
  minLevel: z.string().nullable(),
  maxLevel: z.string().nullable(),
  safetyStock: z.string().nullable(),
  reorderMultiple: z.string().nullable(),
  supplierId: z.string().uuid().nullable(),
  sourceLocationId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const replenishmentActionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  ruleId: z.string().uuid().nullable(),
  locationId: z.string().uuid(),
  itemId: z.string().uuid(),
  stockItemId: z.string().uuid().nullable(),
  actionType: z.enum(['create_po', 'create_transfer', 'alert']),
  quantity: z.string(),
  sourceLocationId: z.string().uuid().nullable(),
  supplierId: z.string().uuid().nullable(),
  status: z.enum(['pending', 'completed', 'failed']),
  purchaseOrderId: z.string().uuid().nullable(),
  stockTransferId: z.string().uuid().nullable(),
  pickTaskId: z.string().uuid().nullable(),
  reason: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  error: z.string().nullable(),
  createdAt: z.string(),
});

export const replenishmentRunSchema = z.object({
  evaluatedRules: z.number(),
  createdActions: z.number(),
  skipped: z.array(z.object({ ruleId: z.string().uuid(), reason: z.string() })).default([]),
  actions: z.array(replenishmentActionSchema),
  analytics: z.record(z.unknown()).default({}),
});

export type ReplenishmentRule = z.infer<typeof replenishmentRuleSchema>;
export type ReplenishmentAction = z.infer<typeof replenishmentActionSchema>;
export type ReplenishmentRun = z.infer<typeof replenishmentRunSchema>;

export async function listReplenishmentRules(api: ApiClient) {
  const data = await api.getData<unknown[]>('replenishment/rules');
  return z.array(replenishmentRuleSchema).parse(data);
}

export async function listReplenishmentActions(api: ApiClient, params?: { locationId?: string; itemId?: string }) {
  const data = await api.getData<unknown[]>('replenishment/actions', { params });
  return z.array(replenishmentActionSchema).parse(data);
}

export async function runReplenishment(api: ApiClient, body: { locationId?: string; itemId?: string; dryRun?: boolean }) {
  const data = await api.postData<unknown>('replenishment/run', body);
  return replenishmentRunSchema.parse(data);
}

export async function saveReplenishmentRule(api: ApiClient, body: {
  id?: string;
  locationId: string;
  itemId: string;
  ruleType: 'min_max' | 'forecast_based' | 'safety_stock';
  minLevel?: number;
  maxLevel?: number;
  safetyStock?: number;
  reorderMultiple?: number;
  supplierId?: string;
  sourceLocationId?: string;
  isActive?: boolean;
}) {
  const data = await api.postData<unknown>(body.id ? 'replenishment/rules/update' : 'replenishment/rules/create', body);
  return replenishmentRuleSchema.parse(data);
}
