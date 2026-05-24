import { getTheme, type TenantTheme } from '@shared-utils';
import { createBrowserApiClient } from './browser';

export async function fetchTenantTheme(): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.getData<Record<string, unknown>>('onboarding/branding');
  const tenantId = (data.tenantId as string) ?? '';
  return getTheme(tenantId, data);
}

export async function updateTenantTheme(body: {
  preset?: 'light' | 'dark' | 'custom';
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
  };
  typography?: { sm?: string; md?: string; lg?: string };
  iconUrl?: string | null;
}): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.patch<{ success: boolean; data: Record<string, unknown> }>(
    'onboarding/branding',
    { theme: body },
  );
  const tenantId = (data.data.tenantId as string) ?? '';
  return getTheme(tenantId, data.data);
}

export async function updateTenantLogo(logoUrl: string): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.patch<{ success: boolean; data: Record<string, unknown> }>(
    'onboarding/branding/logo',
    { logoUrl },
  );
  const tenantId = (data.data.tenantId as string) ?? '';
  return getTheme(tenantId, data.data);
}

export async function updateTenantIcon(iconUrl: string): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.patch<{ success: boolean; data: Record<string, unknown> }>(
    'onboarding/branding/icon',
    { iconUrl },
  );
  const tenantId = (data.data.tenantId as string) ?? '';
  return getTheme(tenantId, data.data);
}
