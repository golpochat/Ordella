import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const twinSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  twinType: z.string(),
  entityRefId: z.string().uuid().nullable(),
  currentVersion: z.number(),
  baselineData: z.record(z.unknown()),
  simulationParameters: z.record(z.unknown()),
  allowedRoles: z.array(z.string()),
  status: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const scenarioSchema = z.object({
  id: z.string().uuid(),
  twinId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  parameters: z.record(z.unknown()),
  forecastOverrides: z.record(z.unknown()),
  extremeConditions: z.record(z.unknown()),
  isBaseline: z.boolean(),
  updatedAt: z.string(),
});

const chartSchema = z.object({
  key: z.string(),
  label: z.string(),
  series: z.array(z.object({ x: z.string(), y: z.number() })),
});

const resultSchema = z.object({
  id: z.string().uuid(),
  kpis: z.record(z.number()),
  charts: z.array(chartSchema),
  metrics: z.record(z.unknown()),
  baselineDeltas: z.record(z.number()),
  riskAnalysis: z.array(z.record(z.unknown())),
  recommendedActions: z.array(z.record(z.unknown())),
  confidenceIntervals: z.record(z.object({ low: z.number(), high: z.number() })),
  aiExplanation: z.string().nullable(),
});

const runSchema = z.object({
  id: z.string().uuid(),
  twinId: z.string().uuid(),
  scenarioId: z.string().uuid().nullable(),
  simulationDomain: z.string(),
  status: z.string(),
  reproducibilitySeed: z.string(),
  sandboxMode: z.boolean(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});

const twinDetailSchema = z.object({
  twin: twinSchema,
  scenarios: z.array(scenarioSchema),
  runs: z.array(runSchema),
  versions: z.array(z.record(z.unknown())),
});

const dashboardSchema = z.object({
  twinCount: z.number(),
  runCount: z.number(),
  scenarioCount: z.number(),
  cachedResults: z.number(),
  recentRuns: z.array(runSchema),
  domains: z.array(z.string()),
  integrations: z.array(z.string()),
  sandboxOnly: z.boolean(),
});

export type DigitalTwin = z.infer<typeof twinSchema>;
export type SimulationScenario = z.infer<typeof scenarioSchema>;
export type SimulationResult = z.infer<typeof resultSchema>;
export type TwinDetail = z.infer<typeof twinDetailSchema>;
export type DigitalTwinsDashboard = z.infer<typeof dashboardSchema>;

export type ScenarioParameters = {
  priceIndex: number;
  staffingLevel: number;
  inventoryLevel: number;
  promoIntensity: number;
  seasonality: number;
  weatherImpact: number;
  supplyChainDelayDays: number;
};

export async function getDigitalTwinsDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('digital-twins/dashboard'));
}

export async function listDigitalTwins(api: ApiClient) {
  return z.array(twinSchema).parse(await api.getData<unknown>('digital-twins/twins'));
}

export async function getDigitalTwin(api: ApiClient, id: string) {
  return twinDetailSchema.parse(await api.getData<unknown>(`digital-twins/twins/${id}`));
}

export async function saveScenario(api: ApiClient, twinId: string, body: { name: string; description?: string; parameters: Record<string, unknown>; extremeConditions?: Record<string, unknown> }) {
  return scenarioSchema.parse(await api.postData<unknown>(`digital-twins/twins/${twinId}/scenarios`, body));
}

export async function runSimulation(api: ApiClient, twinId: string, body: { scenarioId?: string; parameters?: Record<string, unknown>; simulationDomain?: string; reproducibilitySeed?: string }) {
  return z.object({
    run: runSchema,
    result: resultSchema,
    fromCache: z.boolean().optional(),
  }).parse(await api.postData<unknown>(`digital-twins/twins/${twinId}/simulate`, body));
}

export async function compareScenarios(api: ApiClient, twinId: string, scenarioIds: string[]) {
  return z.record(z.unknown()).parse(await api.postData<unknown>(`digital-twins/twins/${twinId}/compare`, { scenarioIds }));
}
