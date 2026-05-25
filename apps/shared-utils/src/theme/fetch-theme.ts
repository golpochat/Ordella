import type { ApiClient } from '../api/client';
import { getTheme } from './theme-registry';
import type { DomainResolveResult, TenantTheme } from './types';

export async function fetchThemeByTenantId(
  api: ApiClient,
  tenantId: string,
): Promise<TenantTheme> {
  const data = await api.getData<{
    tenantId: string;
    logoUrl: string | null;
    iconUrl?: string | null;
    theme: Record<string, unknown>;
  }>(`themes/current`, { params: { tenantId }, skipTenant: true });

  return getTheme(data.tenantId, data);
}

export async function fetchThemeByDomain(
  api: ApiClient,
  domain: string,
): Promise<DomainResolveResult> {
  const data = await api.getData<DomainResolveResult>('public/domain/resolve', {
    params: { domain },
    skipTenant: true,
  });
  return data;
}

export function getThemeFromCache(tenantId: string): TenantTheme | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(`ordella.theme.${tenantId}`);
  if (!raw) return null;
  try {
    return getTheme(tenantId, JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function cacheTheme(tenantId: string, theme: TenantTheme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`ordella.theme.${tenantId}`, JSON.stringify(theme));
}
