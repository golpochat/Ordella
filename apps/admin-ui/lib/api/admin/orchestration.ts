import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const workflowSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  currentVersion: z.number(),
  sandboxMode: z.boolean(),
  allowedRoles: z.array(z.string()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const stepSchema = z.object({
  id: z.string().uuid(),
  stepKey: z.string(),
  stepType: z.string(),
  label: z.string(),
  stepOrder: z.number(),
  config: z.record(z.unknown()),
  branchGroup: z.string().nullable(),
  parallelGroup: z.string().nullable(),
  onErrorPath: z.string().nullable(),
  nextOnSuccess: z.string().nullable(),
  nextOnFailure: z.string().nullable(),
  maxRetries: z.number(),
});

const workflowDetailSchema = z.object({
  workflow: workflowSchema,
  version: z.object({
    id: z.string().uuid(),
    canvasDefinition: z.object({
      nodes: z.array(z.record(z.unknown())),
      edges: z.array(z.record(z.unknown())),
    }),
  }).nullable(),
  steps: z.array(stepSchema),
  triggers: z.array(z.record(z.unknown())),
  versionHistory: z.array(z.record(z.unknown())),
});

const runSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  status: z.string(),
  triggerType: z.string(),
  sandboxRun: z.boolean(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
});

const stepRunSchema = z.object({
  id: z.string().uuid(),
  stepKey: z.string(),
  status: z.string(),
  attemptCount: z.number(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()),
  logs: z.array(z.object({ at: z.string(), level: z.string(), message: z.string() })),
  errorTrace: z.string().nullable(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
});

const dashboardSchema = z.object({
  workflowCount: z.number(),
  activeRuns: z.number(),
  failedRuns: z.number(),
  pendingApprovals: z.number(),
  openDeadLetters: z.number(),
  recentRuns: z.array(runSchema),
  stepTypes: z.array(z.string()),
  integrations: z.array(z.string()),
});

export type Workflow = z.infer<typeof workflowSchema>;
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>;
export type WorkflowRun = z.infer<typeof runSchema>;
export type WorkflowStepRun = z.infer<typeof stepRunSchema>;
export type OrchestrationDashboard = z.infer<typeof dashboardSchema>;

export async function getOrchestrationDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('orchestration/dashboard'));
}

export async function listWorkflows(api: ApiClient) {
  return z.array(workflowSchema).parse(await api.getData<unknown>('orchestration/workflows'));
}

export async function getWorkflow(api: ApiClient, id: string) {
  return workflowDetailSchema.parse(await api.getData<unknown>(`orchestration/workflows/${id}`));
}

export async function saveWorkflowCanvas(
  api: ApiClient,
  id: string,
  body: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
    steps?: Array<{
      stepKey: string;
      stepType: string;
      label: string;
      stepOrder: number;
      config: Record<string, unknown>;
      nextOnSuccess?: string;
      nextOnFailure?: string;
      parallelGroup?: string;
    }>;
  },
) {
  const response = await api.put<{ success: boolean; data: unknown }>(`orchestration/workflows/${id}/canvas`, body);
  return workflowDetailSchema.parse(response.data);
}

export async function startWorkflowRun(api: ApiClient, workflowId: string, body?: { sandbox?: boolean; context?: Record<string, unknown> }) {
  return z.object({ run: runSchema, stepRuns: z.array(stepRunSchema) }).parse(
    await api.postData<unknown>(`orchestration/workflows/${workflowId}/run`, body ?? {}),
  );
}

export async function listWorkflowRuns(api: ApiClient, workflowId?: string) {
  return z.array(runSchema).parse(await api.getData<unknown>('orchestration/runs', {
    params: workflowId ? { workflowId } : undefined,
  }));
}

export async function getWorkflowRun(api: ApiClient, runId: string) {
  return z.object({ run: runSchema, stepRuns: z.array(stepRunSchema) }).parse(
    await api.getData<unknown>(`orchestration/runs/${runId}`),
  );
}

export async function listApprovalInbox(api: ApiClient) {
  return z.array(z.record(z.unknown())).parse(await api.getData<unknown>('orchestration/approvals/inbox'));
}

export async function resolveApproval(api: ApiClient, approvalId: string, body: { decision: 'approved' | 'rejected'; comment?: string }) {
  return z.record(z.unknown()).parse(await api.postData<unknown>(`orchestration/approvals/${approvalId}/resolve`, body));
}

export async function listDeadLetters(api: ApiClient) {
  return z.array(z.record(z.unknown())).parse(await api.getData<unknown>('orchestration/dead-letters'));
}
