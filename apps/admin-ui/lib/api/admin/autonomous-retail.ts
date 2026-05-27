import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const policySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  locationId: z.string().uuid().nullable(),
  mode: z.enum(['fully_autonomous', 'semi_autonomous', 'suggestion_only']),
  pricingEnabled: z.boolean(),
  replenishmentEnabled: z.boolean(),
  staffingEnabled: z.boolean(),
  promotionEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  overrides: z.record(z.unknown()),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

const decisionSchema = z.object({
  id: z.string().uuid(),
  modelType: z.string(),
  actionType: z.string(),
  status: z.string(),
  confidence: z.string(),
  explanation: z.string(),
  predictedImpact: z.record(z.number()),
  alternativesConsidered: z.array(z.record(z.unknown())),
  payload: z.record(z.unknown()),
  createdAt: z.string(),
});

const actionSchema = z.object({
  id: z.string().uuid(),
  actionType: z.string(),
  status: z.string(),
  payload: z.record(z.unknown()),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  executedAt: z.string().nullable(),
  rolledBackAt: z.string().nullable(),
});

const dashboardSchema = z.object({
  pendingDecisions: z.number(),
  recentActions: z.array(actionSchema),
  blockedActions: z.number(),
  policies: z.array(policySchema),
  riskAlerts: z.array(z.object({ level: z.string(), message: z.string() })),
  modelTypes: z.array(z.string()),
  integrations: z.array(z.string()),
});

const constraintSchema = z.object({
  id: z.string().uuid(),
  constraintKey: z.string(),
  displayName: z.string(),
  rules: z.record(z.unknown()),
  isActive: z.boolean(),
});

export type AutonomousDashboard = z.infer<typeof dashboardSchema>;
export type AutonomousPolicy = z.infer<typeof policySchema>;
export type AutonomousDecision = z.infer<typeof decisionSchema>;
export type AutonomousAction = z.infer<typeof actionSchema>;

export async function getAutonomousDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('autonomous-retail/dashboard'));
}

export async function listAutonomousPolicies(api: ApiClient) {
  return z.array(policySchema).parse(await api.getData<unknown>('autonomous-retail/policies'));
}

export async function updateAutonomousPolicy(api: ApiClient, body: Partial<AutonomousPolicy>) {
  const response = await api.put<{ success: boolean; data: unknown }>('autonomous-retail/policies', body);
  return policySchema.parse(response.data);
}

export async function listAutonomousConstraints(api: ApiClient) {
  return z.array(constraintSchema).parse(await api.getData<unknown>('autonomous-retail/constraints'));
}

export async function listAutonomousDecisions(api: ApiClient, status?: string) {
  return z.array(decisionSchema).parse(await api.getData<unknown>('autonomous-retail/decisions', {
    params: status ? { status } : undefined,
  }));
}

export async function listAutonomousActions(api: ApiClient) {
  return z.array(actionSchema).parse(await api.getData<unknown>('autonomous-retail/actions'));
}

export async function generateAutonomousDecisions(api: ApiClient, body?: { locationId?: string; batch?: boolean }) {
  return z.record(z.unknown()).parse(await api.postData<unknown>('autonomous-retail/decisions/generate', body ?? { batch: true }));
}

export async function resolveAutonomousDecision(api: ApiClient, id: string, decision: 'approved' | 'rejected', comment?: string) {
  return z.record(z.unknown()).parse(await api.postData<unknown>(`autonomous-retail/decisions/${id}/resolve`, { decision, comment }));
}

export async function rollbackAutonomousAction(api: ApiClient, actionId: string) {
  return actionSchema.parse(await api.postData<unknown>(`autonomous-retail/actions/${actionId}/rollback`, {}));
}
