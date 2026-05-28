'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@shared-ui';
import { createApiClient, DEFAULT_THEME, type TenantTheme } from '@shared-utils';
import { cacheTheme, fetchThemeByTenantId, getThemeFromCache } from '@shared-utils';
import { getCustomerAccessToken, tokenStorage } from '@/lib/session';
import { getApiBaseUrl, getTenantId } from '@/lib/config';

type ThemeRootProps = {
  children: React.ReactNode;
};

export function ThemeRoot({ children }: ThemeRootProps) {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  useEffect(() => {
    const tenantId = tokenStorage.getTenantId() ?? getTenantId();
    if (!tenantId) return;

    const cached = getThemeFromCache(tenantId);
    if (cached) setTheme(cached);

    // Unauthenticated (e.g. login): use cache/default only — avoids failed theme API calls in dev.
    if (!getCustomerAccessToken()) return;

    const api = createApiClient({
      baseUrl: getApiBaseUrl(),
      getAccessToken: () => tokenStorage.getAccessToken(),
      getTenantId: () => tenantId,
    });

    void fetchThemeByTenantId(api, tenantId)
      .then((resolved) => {
        cacheTheme(tenantId, resolved);
        setTheme(resolved);
      })
      .catch(() => undefined);
  }, []);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
