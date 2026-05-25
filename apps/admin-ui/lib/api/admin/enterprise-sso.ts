import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

export const ssoProviderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  providerType: z.enum(['azure_ad', 'okta', 'google', 'saml', 'oidc']),
  clientId: z.string().nullable().optional(),
  clientSecretConfigured: z.boolean(),
  issuerUrl: z.string().nullable().optional(),
  redirectUrl: z.string().nullable().optional(),
  metadataUrl: z.string().nullable().optional(),
  authorizationUrl: z.string().nullable().optional(),
  tokenUrl: z.string().nullable().optional(),
  jwksUri: z.string().nullable().optional(),
  defaultRole: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const ssoRoleMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  providerId: z.string().uuid().nullable().optional(),
  externalRole: z.string(),
  internalRole: z.string(),
  createdAt: z.string(),
});

export const federatedUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  roleId: z.string().uuid(),
  roleName: z.string().nullable().optional(),
  externalId: z.string().nullable().optional(),
  federatedRoles: z.array(z.string()).default([]),
  lastLoginAt: z.string().nullable().optional(),
  status: z.string(),
});

export type SsoProvider = z.infer<typeof ssoProviderSchema>;
export type SsoRoleMapping = z.infer<typeof ssoRoleMappingSchema>;
export type FederatedUser = z.infer<typeof federatedUserSchema>;

export async function listSsoProviders(api: ApiClient): Promise<SsoProvider[]> {
  const data = await api.getData<unknown[]>('sso/providers');
  return z.array(ssoProviderSchema).parse(data);
}

export async function createSsoProvider(api: ApiClient, body: Record<string, unknown>): Promise<SsoProvider> {
  const data = await api.postData<unknown>('sso/providers/create', body);
  return ssoProviderSchema.parse(data);
}

export async function updateSsoProvider(api: ApiClient, body: Record<string, unknown>): Promise<SsoProvider> {
  const data = await api.postData<unknown>('sso/providers/update', body);
  return ssoProviderSchema.parse(data);
}

export async function listSsoRoleMappings(api: ApiClient): Promise<SsoRoleMapping[]> {
  const data = await api.getData<unknown[]>('sso/role-mappings');
  return z.array(ssoRoleMappingSchema).parse(data);
}

export async function updateSsoRoleMappings(api: ApiClient, mappings: Array<Record<string, unknown>>): Promise<SsoRoleMapping[]> {
  const data = await api.postData<unknown[]>('sso/role-mappings/update', { mappings });
  return z.array(ssoRoleMappingSchema).parse(data);
}

export async function listFederatedUsers(api: ApiClient): Promise<FederatedUser[]> {
  const data = await api.getData<unknown[]>('sso/federated-users');
  return z.array(federatedUserSchema).parse(data);
}

export async function resetFederatedUser(api: ApiClient, userId: string): Promise<void> {
  await api.postData<unknown>('sso/federated-users/reset', { userId });
}
