'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@shared-ui';
import { createApiClient, DEFAULT_THEME, type PosTheme, type TenantTheme } from '@shared-utils';
import { cacheTheme, fetchThemeByTenantId, getThemeFromCache } from '@shared-utils';
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

type ThemeRootProps = {
  children: React.ReactNode;
};

function getTenantId(): string {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_TENANT_ID ?? '';
  return window.localStorage.getItem('ordella.tenantId') ?? process.env.NEXT_PUBLIC_TENANT_ID ?? '';
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('ordella.accessToken');
}

function toPosTheme(theme: TenantTheme): TenantTheme {
  const posTheme = (theme.posTheme ?? DEFAULT_THEME.posTheme) as PosTheme | undefined;
  if (!posTheme) return theme;

  return {
    ...theme,
    preset: posTheme.mode,
    colors: {
      ...theme.colors,
      primary: posTheme.primaryColor,
      accent: posTheme.accentColor,
      background: posTheme.backgroundColor,
      surface: posTheme.surfaceColor,
      text: posTheme.textColor,
    },
    typography: {
      ...theme.typography,
      headingFont: posTheme.headingFont,
      bodyFont: posTheme.bodyFont,
    },
    logoUrl: posTheme.logoUrl ?? theme.logoUrl,
  };
}

export function ThemeRoot({ children }: ThemeRootProps) {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  useEffect(() => {
    const tenantId = getTenantId();
    if (!tenantId) return;

    const cached = getThemeFromCache(tenantId);
    if (cached) setTheme(cached);

    const api = createApiClient({
      baseUrl: getApiBaseUrl(),
      getAccessToken,
      getTenantId: () => tenantId,
    });

    void fetchThemeByTenantId(api, tenantId)
      .then((resolved) => {
        cacheTheme(tenantId, resolved);
        setTheme(resolved);
      })
      .catch(() => undefined);
  }, []);

  return <ThemeProvider theme={toPosTheme(theme)}>{children}</ThemeProvider>;
}
