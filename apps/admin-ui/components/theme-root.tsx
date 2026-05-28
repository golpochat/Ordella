'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@shared-ui';
import { ToastProvider } from '@/components/ui/admin-toast';
import { AdminTooltipProvider } from '@/components/ui/admin-tooltip';
import { AdminShortcutProvider } from '@/components/ui/admin-shortcuts';
import { AdminAccessibilityShell } from '@/components/ui/admin-a11y';
import { AdminI18nProvider } from '@/components/ui/admin-i18n';
import { AdminPerformanceProvider } from '@/components/ui/admin-performance';
import { DEFAULT_THEME, type TenantTheme } from '@shared-utils';
import { cacheTheme, getThemeFromCache } from '@shared-utils';
import { browserTokenStorage } from '@/lib/api/browser';
import { fetchTenantTheme } from '@/lib/api/branding';

type ThemeRootProps = {
  children: React.ReactNode;
};

export function ThemeRoot({ children }: ThemeRootProps) {
  const [theme, setTheme] = useState<TenantTheme>(DEFAULT_THEME);

  useEffect(() => {
    const tenantId = browserTokenStorage.getTenantId();
    if (!tenantId) return;

    const cached = getThemeFromCache(tenantId);
    if (cached) setTheme(cached);

    void fetchTenantTheme()
      .then((resolved) => {
        cacheTheme(tenantId, resolved);
        setTheme(resolved);
      })
      .catch(() => undefined);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AdminI18nProvider>
      <AdminPerformanceProvider>
        <AdminAccessibilityShell>
          <AdminTooltipProvider>
            <AdminShortcutProvider>
              <ToastProvider>{children}</ToastProvider>
            </AdminShortcutProvider>
          </AdminTooltipProvider>
        </AdminAccessibilityShell>
      </AdminPerformanceProvider>
      </AdminI18nProvider>
    </ThemeProvider>
  );
}
