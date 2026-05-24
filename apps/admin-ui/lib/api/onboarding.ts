import type { ApiClient } from '@shared-utils';
import {
  fetchTenantList,
  switchTenantContext,
  type TenantOption,
} from '@shared-utils';
import { createBrowserApiClient } from './browser';
import { browserTokenStorage } from './browser';

export async function loadTenantsForSwitcher(): Promise<TenantOption[]> {
  const api = createBrowserApiClient();
  return fetchTenantList(api);
}

export async function switchActiveTenant(tenantId: string): Promise<TenantOption | null> {
  const api = createBrowserApiClient();
  return switchTenantContext(api, browserTokenStorage, tenantId);
}

export type { TenantOption };
