'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@shared-ui';
import { createApiClient, DEFAULT_THEME, type TenantTheme } from '@shared-utils';
import { cacheTheme, fetchThemeByTenantId, getThemeFromCache } from '@shared-utils';
import { getApiBaseUrl, getTenantId } from '@/lib/config';

type ThemeRootProps = {
  children: React.ReactNode;
};

export function ThemeRoot({ children }: ThemeRootProps) {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  useEffect(() => {
    const tenantId = getTenantId();
    if (!tenantId) return;

    const cached = getThemeFromCache(tenantId);
    if (cached) setTheme(cached);

    const api = createApiClient({
      baseUrl: getApiBaseUrl(),
      getAccessToken: () => null,
      getTenantId: () => tenantId,
    });

    void fetchThemeByTenantId(api, tenantId)
      .then((resolved) => {
        cacheTheme(tenantId, resolved);
        setTheme(resolved);
      })
      .catch(() => {
        /* keep default/cached */
      });
  }, []);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
