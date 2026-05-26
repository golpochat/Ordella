import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const organizationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  globalSettings: z.record(z.unknown()),
  taxRules: z.record(z.unknown()),
  promotionPolicy: z.record(z.unknown()),
  catalogPolicy: z.record(z.unknown()),
  ssoPolicy: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const regionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  parentRegionId: z.string().uuid().nullable(),
  name: z.string(),
  regionType: z.string(),
  country: z.string().nullable(),
  state: z.string().nullable(),
  overrides: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const enterpriseLocationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  regionId: z.string().uuid().nullable().optional(),
  name: z.string(),
  address: z.string().nullable(),
  status: z.string(),
  locationType: z.string(),
  fulfillmentMode: z.string(),
});

const assignmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  roleId: z.string().uuid().nullable(),
  scopeType: z.string(),
  organizationId: z.string().uuid().nullable(),
  regionId: z.string().uuid().nullable(),
  locationId: z.string().uuid().nullable(),
  staffRole: z.string(),
  createdAt: z.string(),
});

const hierarchySchema = z.object({
  organization: organizationSchema,
  regions: z.array(regionSchema),
  locations: z.array(enterpriseLocationSchema),
  assignments: z.array(assignmentSchema),
  permissionMatrix: z.array(z.object({
    role: z.string(),
    scope: z.string(),
    permissions: z.array(z.string()),
  })),
});

const dashboardSchema = z.object({
  organizationId: z.string().uuid(),
  scope: z.object({
    scopeType: z.string(),
    scopeId: z.string(),
    locationIds: z.array(z.string().uuid()),
  }),
  sales: z.object({ orders: z.number(), revenue: z.number(), averageOrderValue: z.number() }),
  inventory: z.object({ totalItems: z.number(), lowStock: z.number(), outOfStock: z.number() }),
  delivery: z.object({ totalDeliveries: z.number(), delivered: z.number(), failed: z.number(), completionRate: z.number() }),
  staff: z.object({ staffCount: z.number() }),
  regionComparisons: z.array(z.record(z.unknown())),
  topLocations: z.array(z.record(z.unknown())),
  bottomLocations: z.array(z.record(z.unknown())),
  locationPerformance: z.array(z.record(z.unknown())),
});

export type EnterpriseHierarchy = z.infer<typeof hierarchySchema>;
export type EnterpriseOrganization = z.infer<typeof organizationSchema>;
export type EnterpriseRegion = z.infer<typeof regionSchema>;
export type EnterpriseLocation = z.infer<typeof enterpriseLocationSchema>;
export type EnterpriseAssignment = z.infer<typeof assignmentSchema>;
export type EnterpriseDashboard = z.infer<typeof dashboardSchema>;

export async function fetchEnterpriseHierarchy(api: ApiClient) {
  return hierarchySchema.parse(await api.getData<unknown>('enterprise/hierarchy'));
}

export async function fetchEnterpriseDashboard(api: ApiClient, params?: { scopeType?: string; scopeId?: string }) {
  return dashboardSchema.parse(await api.getData<unknown>('enterprise/dashboard', { params }));
}

export async function createEnterpriseRegion(api: ApiClient, body: {
  organizationId: string;
  parentRegionId?: string;
  name: string;
  regionType?: string;
  country?: string;
  state?: string;
}) {
  return regionSchema.parse(await api.postData<unknown>('enterprise/regions', body));
}

export async function assignRegionLocations(api: ApiClient, regionId: string, locationIds: string[]) {
  return hierarchySchema.parse(await api.postData<unknown>(`enterprise/regions/${regionId}/locations`, { locationIds }));
}

export async function assignEnterpriseAccess(api: ApiClient, body: {
  userId: string;
  roleId?: string;
  scopeType: string;
  organizationId?: string;
  regionId?: string;
  locationId?: string;
  staffRole?: string;
}) {
  return assignmentSchema.parse(await api.postData<unknown>('enterprise/access-assignments', body));
}

export async function updateEnterpriseSettings(api: ApiClient, organizationId: string, body: Partial<Pick<EnterpriseOrganization, 'globalSettings' | 'taxRules' | 'promotionPolicy' | 'catalogPolicy' | 'ssoPolicy'>>) {
  return organizationSchema.parse(await api.patch<{ success: boolean; data: unknown }>(`enterprise/organizations/${organizationId}/settings`, body).then((res) => res.data));
}

export async function updateEnterpriseSsoPolicy(api: ApiClient, organizationId: string, ssoPolicy: Record<string, unknown>) {
  return api.patch<{ success: boolean; data: unknown }>(`enterprise/organizations/${organizationId}/sso-policy`, { ssoPolicy }).then((res) => res.data);
}
