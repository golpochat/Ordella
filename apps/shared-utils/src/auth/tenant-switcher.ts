import type { ApiClient } from '../api/client';
import type { TokenStorage } from './storage';

export type TenantOption = {
  tenantId: string;
  tenantName: string;
  slug: string | null;
  roleId: string;
  roleName: string;
  isActive: boolean;
};

const TENANT_LIST_CACHE_KEY = 'ordella.tenantList';

function readCache(): TenantOption[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(TENANT_LIST_CACHE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TenantOption[];
  } catch {
    return [];
  }
}

function writeCache(tenants: TenantOption[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TENANT_LIST_CACHE_KEY, JSON.stringify(tenants));
}

export function getActiveTenantId(storage: TokenStorage): string | null {
  return storage.getTenantId();
}

export function setActiveTenantId(storage: TokenStorage, tenantId: string): void {
  storage.setTenantId(tenantId);
}

export function getCachedTenantList(): TenantOption[] {
  return readCache();
}

export async function fetchTenantList(api: ApiClient): Promise<TenantOption[]> {
  const data = await api.getData<TenantOption[]>('onboarding/tenants');
  writeCache(data);
  return data;
}

export async function switchTenantContext(
  api: ApiClient,
  storage: TokenStorage,
  tenantId: string,
): Promise<TenantOption | null> {
  const result = await api.postData<{
    accessToken: string;
    tenantId: string;
    roleName: string;
  }>('onboarding/tenants/switch', { tenantId });

  storage.setAccessToken(result.accessToken);
  storage.setTenantId(result.tenantId);

  const tenants = await fetchTenantList(api);
  return tenants.find((t) => t.tenantId === result.tenantId) ?? null;
}
