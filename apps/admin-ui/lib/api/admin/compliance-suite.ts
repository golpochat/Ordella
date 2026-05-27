import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const dashboardSchema = z.object({
  frameworks: z.number(),
  controls: z.number(),
  risks: z.number(),
  openIncidents: z.number(),
  openAlerts: z.number(),
  evidenceCount: z.number(),
  publishedPolicies: z.number(),
  vendors: z.number(),
  controlCoveragePercent: z.number(),
  riskHeatmap: z.object({
    matrix: z.record(z.number()),
    topRisks: z.array(z.object({ id: z.string(), title: z.string(), score: z.number() })),
  }),
  auditCenter: z.record(z.unknown()),
  security: z.record(z.unknown()),
  dataGovernance: z.record(z.unknown()),
  monitoring: z.record(z.unknown()),
});

const frameworkSchema = z.object({
  id: z.string().uuid(),
  frameworkKey: z.string(),
  displayName: z.string(),
  frameworkType: z.string(),
  status: z.string(),
  controlCount: z.number(),
});

const riskSchema = z.object({
  id: z.string().uuid(),
  riskKey: z.string(),
  title: z.string(),
  likelihood: z.number(),
  impact: z.number(),
  inherentScore: z.number(),
  residualScore: z.number(),
  status: z.string(),
});

const policySchema = z.object({
  id: z.string().uuid(),
  policyKey: z.string(),
  version: z.number(),
  title: z.string(),
  content: z.string(),
  status: z.string(),
});

const evidenceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  evidenceType: z.string(),
  storageUri: z.string(),
  status: z.string(),
  collectedAt: z.string(),
});

const securitySettingsSchema = z.object({
  mfaEnforced: z.boolean(),
  passwordPolicy: z.record(z.unknown()),
  sessionPolicy: z.record(z.unknown()),
  deviceTrustRules: z.array(z.unknown()),
  ipAllowlist: z.array(z.string()),
  ssoConfig: z.record(z.unknown()),
  scimEnabled: z.boolean(),
});

export type ComplianceDashboard = z.infer<typeof dashboardSchema>;
export type ComplianceFramework = z.infer<typeof frameworkSchema>;
export type ComplianceRisk = z.infer<typeof riskSchema>;
export type CompliancePolicy = z.infer<typeof policySchema>;
export type ComplianceEvidence = z.infer<typeof evidenceSchema>;
export type ComplianceSecuritySettings = z.infer<typeof securitySettingsSchema>;

export async function fetchComplianceDashboard(api: ApiClient): Promise<ComplianceDashboard> {
  return dashboardSchema.parse(await api.getData<unknown>('compliance-suite/dashboard'));
}

export async function listComplianceFrameworks(api: ApiClient): Promise<ComplianceFramework[]> {
  return frameworkSchema.array().parse(await api.getData<unknown[]>('compliance-suite/frameworks'));
}

export async function listComplianceRisks(api: ApiClient): Promise<ComplianceRisk[]> {
  return riskSchema.array().parse(await api.getData<unknown[]>('compliance-suite/risks'));
}

export async function listCompliancePolicies(api: ApiClient): Promise<CompliancePolicy[]> {
  return policySchema.array().parse(await api.getData<unknown[]>('compliance-suite/policies'));
}

export async function listComplianceEvidence(api: ApiClient): Promise<ComplianceEvidence[]> {
  return evidenceSchema.array().parse(await api.getData<unknown[]>('compliance-suite/evidence'));
}

export async function getComplianceSecurity(api: ApiClient): Promise<ComplianceSecuritySettings> {
  return securitySettingsSchema.parse(await api.getData<unknown>('compliance-suite/security'));
}

export async function saveCompliancePolicy(
  api: ApiClient,
  body: { policyKey: string; title: string; content: string; status?: 'draft' | 'published' },
) {
  return policySchema.parse(await api.postData<unknown>('compliance-suite/policies', body));
}

export async function uploadComplianceEvidence(
  api: ApiClient,
  body: { title: string; storageUri?: string; controlId?: string },
) {
  return evidenceSchema.parse(await api.postData<unknown>('compliance-suite/evidence', body));
}

export async function runComplianceControlTests(api: ApiClient, controlIds?: string[]) {
  return api.postData<unknown[]>('compliance-suite/controls/test', controlIds?.length ? { controlIds } : {});
}

export async function exportComplianceReport(
  api: ApiClient,
  body: { reportType: string; format?: 'json' | 'csv' },
) {
  return api.postData<unknown>('compliance-suite/reports/export', body);
}
