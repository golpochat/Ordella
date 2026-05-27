import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const zoneSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  zoneKey: z.enum(['raw', 'processed', 'analytics', 'ml']),
  displayName: z.string(),
  description: z.string().nullable(),
  retentionDays: z.number(),
  immutable: z.boolean(),
  objectCount: z.string(),
  bytesEstimate: z.string(),
  lastIngestedAt: z.string().nullable(),
  metadata: z.record(z.unknown()),
  updatedAt: z.string(),
});

const pipelineSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineKey: z.string(),
  displayName: z.string(),
  pipelineType: z.string(),
  sourceZone: z.string().nullable(),
  targetZone: z.string().nullable(),
  scheduleCron: z.string().nullable(),
  status: z.string(),
  isActive: z.boolean(),
  lastRunAt: z.string().nullable(),
  lastSuccessAt: z.string().nullable(),
  config: z.record(z.unknown()),
  updatedAt: z.string(),
});

const pipelineRunSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  status: z.string(),
  runMode: z.string(),
  partitionDate: z.string().nullable(),
  recordsIn: z.string(),
  recordsOut: z.string(),
  recordsDeduped: z.string(),
  recordsRejected: z.string(),
  errorMessage: z.string().nullable(),
  errors: z.array(z.record(z.unknown())),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  metrics: z.record(z.unknown()),
});

const schemaRowSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  entityType: z.string(),
  version: z.number(),
  schemaJson: z.record(z.unknown()),
  isActive: z.boolean(),
  createdAt: z.string(),
});

const warehouseTableSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  tableKey: z.string(),
  displayName: z.string(),
  tableKind: z.string(),
  grain: z.string().nullable(),
  rowCount: z.string(),
  lastRefreshedAt: z.string().nullable(),
  isMaterialized: z.boolean(),
  columns: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
  updatedAt: z.string(),
});

const exportSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  target: z.string(),
  entityType: z.string(),
  zoneKey: z.string(),
  status: z.string(),
  rowCount: z.string(),
  exportUri: z.string().nullable(),
  piiMasked: z.boolean(),
  requestedBy: z.string().uuid().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  finishedAt: z.string().nullable(),
  metadata: z.record(z.unknown()),
});

const dashboardSchema = z.object({
  zones: z.array(zoneSchema),
  pipelines: z.array(pipelineSchema),
  recentRuns: z.array(pipelineRunSchema),
  failedRunCount: z.number(),
  schemaCount: z.number(),
  warehouseTables: z.array(warehouseTableSchema),
  materializedViews: z.array(z.record(z.unknown())),
  featureCount: z.number(),
  freshness: z.array(z.object({
    zoneKey: z.string(),
    lastIngestedAt: z.string().nullable(),
    stale: z.boolean(),
    objectCount: z.string(),
    bytesEstimate: z.string(),
  })),
  performance: z.record(z.unknown()),
  integrations: z.array(z.string()),
});

export type DataLakeDashboard = z.infer<typeof dashboardSchema>;
export type DataLakePipeline = z.infer<typeof pipelineSchema>;
export type DataLakePipelineRun = z.infer<typeof pipelineRunSchema>;
export type DataLakeSchema = z.infer<typeof schemaRowSchema>;
export type DataLakeWarehouseTable = z.infer<typeof warehouseTableSchema>;
export type DataLakeExport = z.infer<typeof exportSchema>;

export async function getDataLakeDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('data-lake/dashboard'));
}

export async function listDataLakeSchemas(api: ApiClient) {
  return z.array(schemaRowSchema).parse(await api.getData<unknown>('data-lake/schemas'));
}

export async function listPipelineRuns(api: ApiClient, pipelineKey?: string) {
  return z.array(pipelineRunSchema).parse(await api.getData<unknown>('data-lake/pipelines/runs', {
    params: pipelineKey ? { pipelineKey } : undefined,
  }));
}

export async function runDataPipeline(api: ApiClient, body: { pipelineKey: string; runMode?: string; partitionDate?: string }) {
  return z.record(z.unknown()).parse(await api.postData<unknown>('data-lake/pipelines/run', body));
}

export async function streamIngest(api: ApiClient, body?: { topicKey?: string; limit?: number }) {
  return z.record(z.unknown()).parse(await api.postData<unknown>('data-lake/ingest/stream', body ?? {}));
}

export async function listDataLakeExports(api: ApiClient) {
  return z.array(exportSchema).parse(await api.getData<unknown>('data-lake/exports'));
}

export async function createDataLakeExport(
  api: ApiClient,
  body: { target: string; entityType: string; zoneKey?: string; piiMasked?: boolean },
) {
  return exportSchema.parse(await api.postData<unknown>('data-lake/exports', body));
}
