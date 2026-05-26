import { getTheme, type BaseTheme, type HomepageSection, type TenantTheme } from '@shared-utils';
import { createBrowserApiClient } from './browser';

export type ThemeAssetType = 'logo' | 'banner' | 'background' | 'favicon';

export type BaseThemeOption = {
  id: BaseTheme;
  name: string;
  description: string;
};

export type ThemeUpdatePayload = Partial<
  Pick<TenantTheme, 'name' | 'baseTheme' | 'preset' | 'colors' | 'typography' | 'layout' | 'posTheme' | 'assets' | 'seo'>
> & {
  homepageSections?: HomepageSection[];
};

export async function fetchCurrentTheme(): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.getData<Record<string, unknown>>('themes/current');
  return getTheme((data.tenantId as string) ?? '', data);
}

export async function fetchBaseThemes(): Promise<BaseThemeOption[]> {
  const api = createBrowserApiClient();
  return api.getData<BaseThemeOption[]>('themes/base-themes');
}

export async function updateStorefrontTheme(body: ThemeUpdatePayload): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.postData<Record<string, unknown>>('themes/update', body);
  return getTheme((data.tenantId as string) ?? '', data);
}

export async function uploadThemeAsset(type: ThemeAssetType, url: string): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.postData<Record<string, unknown>>('themes/upload-asset', { type, url });
  return getTheme((data.tenantId as string) ?? '', data);
}

export async function resetStorefrontTheme(): Promise<TenantTheme> {
  const api = createBrowserApiClient();
  const data = await api.postData<Record<string, unknown>>('themes/reset');
  return getTheme((data.tenantId as string) ?? '', data);
}
