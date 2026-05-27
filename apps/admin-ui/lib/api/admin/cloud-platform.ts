import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const dashboardSchema = z.object({
  regions: z.number(),
  providers: z.array(z.string()),
  openAlerts: z.number(),
  edgeUptimePercent: z.number(),
  activeDeployments: z.number(),
  latencyHeatmap: z.record(
    z.object({
      p50: z.number(),
      p99: z.number(),
      errorRate: z.number(),
    }),
  ),
  residency: z.object({
    euOnlyMode: z.boolean(),
    usOnlyMode: z.boolean(),
    apacResidency: z.boolean(),
    allowedRegions: z.array(z.unknown()),
  }),
  routing: z.object({
    failoverMode: z.string(),
    storefrontGeo: z.boolean(),
    posLowLatency: z.boolean(),
  }),
  multiCloud: z.object({
    aws: z.number(),
    azure: z.number(),
    gcp: z.number(),
  }),
});

const regionSchema = z.object({
  id: z.string().uuid(),
  regionCode: z.string(),
  displayName: z.string(),
  cloudProvider: z.string(),
  status: z.string(),
  isPrimary: z.boolean(),
  capabilities: z
    .object({
      latencyClass: z.string(),
      dataResidencyZones: z.array(z.unknown()),
      supportedModules: z.array(z.unknown()),
    })
    .nullable()
    .optional(),
});

const residencySchema = z.object({
  euOnlyMode: z.boolean(),
  usOnlyMode: z.boolean(),
  apacResidency: z.boolean(),
  allowedRegions: z.array(z.unknown()),
  enforceStrict: z.boolean(),
});

const failoverSchema = z.object({
  id: z.string().uuid(),
  primaryRegionId: z.string().uuid(),
  failoverRegionId: z.string().uuid(),
  mode: z.string(),
  autoFailover: z.boolean(),
  rpoSeconds: z.number(),
  rtoSeconds: z.number(),
});

const metricsSchema = z.object({
  regionId: z.string().uuid(),
  regionCode: z.string(),
  displayName: z.string(),
  cloudProvider: z.string(),
  metrics: z
    .object({
      healthStatus: z.string(),
      latencyP50Ms: z.number(),
      latencyP99Ms: z.number(),
      errorRatePercent: z.union([z.number(), z.string()]),
    })
    .nullable(),
});

const edgeNodeSchema = z.object({
  id: z.string().uuid(),
  nodeKey: z.string(),
  nodeType: z.string(),
  displayName: z.string(),
  status: z.string(),
  uptimePercent: z.union([z.number(), z.string()]),
  offlineFirst: z.boolean(),
});

const deploymentSchema = z.object({
  id: z.string().uuid(),
  deploymentKey: z.string(),
  deploymentType: z.string(),
  strategy: z.string(),
  status: z.string(),
  version: z.string(),
  canaryPercent: z.number(),
});

export type CloudDashboard = z.infer<typeof dashboardSchema>;
export type CloudRegion = z.infer<typeof regionSchema>;
export type CloudResidencyPolicy = z.infer<typeof residencySchema>;
export type CloudFailoverRule = z.infer<typeof failoverSchema>;
export type CloudRegionMetrics = z.infer<typeof metricsSchema>;
export type CloudEdgeNode = z.infer<typeof edgeNodeSchema>;
export type CloudDeployment = z.infer<typeof deploymentSchema>;

export async function fetchCloudDashboard(api: ApiClient): Promise<CloudDashboard> {
  return dashboardSchema.parse(await api.getData<unknown>('cloud-platform/dashboard'));
}

export async function listCloudRegions(api: ApiClient): Promise<CloudRegion[]> {
  return regionSchema.array().parse(await api.getData<unknown[]>('cloud-platform/regions'));
}

export async function getCloudResidency(api: ApiClient): Promise<CloudResidencyPolicy> {
  return residencySchema.parse(await api.getData<unknown>('cloud-platform/residency'));
}

export async function saveCloudResidency(
  api: ApiClient,
  body: Partial<{
    euOnlyMode: boolean;
    usOnlyMode: boolean;
    apacResidency: boolean;
    allowedRegions: string[];
    enforceStrict: boolean;
  }>,
) {
  const res = await api.put<{ success: boolean; data: unknown }>('cloud-platform/residency', body);
  return residencySchema.parse(res.data);
}

export async function listCloudFailover(api: ApiClient): Promise<CloudFailoverRule[]> {
  return failoverSchema.array().parse(await api.getData<unknown[]>('cloud-platform/failover'));
}

export async function listCloudMetrics(api: ApiClient): Promise<CloudRegionMetrics[]> {
  return metricsSchema.array().parse(await api.getData<unknown[]>('cloud-platform/metrics'));
}

export async function listCloudEdgeNodes(api: ApiClient): Promise<CloudEdgeNode[]> {
  return edgeNodeSchema.array().parse(await api.getData<unknown[]>('cloud-platform/edge-nodes'));
}

export async function listCloudDeployments(api: ApiClient): Promise<CloudDeployment[]> {
  return deploymentSchema.array().parse(await api.getData<unknown[]>('cloud-platform/deployments'));
}

export async function startCloudDeployment(
  api: ApiClient,
  body: {
    regionId: string;
    deploymentType: 'blue_green' | 'canary' | 'scale';
    strategy?: string;
    canaryPercent?: number;
  },
) {
  return deploymentSchema.parse(await api.postData<unknown>('cloud-platform/deployments', body));
}

export async function rollbackCloudDeployment(api: ApiClient, deploymentId: string) {
  return deploymentSchema.parse(
    await api.postData<unknown>(`cloud-platform/deployments/${deploymentId}/rollback`, {}),
  );
}
