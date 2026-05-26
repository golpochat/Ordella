'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_TENANT_SETTINGS,
  formatTenantCurrency,
  formatTenantDate,
  formatTenantDateTime,
  formatTenantNumber,
  normalizeTenantSettings,
  type TenantSettings,
} from '@shared-utils';
import { fetchTenantSettings } from '@/lib/api';

export function useTenantSettings() {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTenantSettings()
      .then((data) => {
        if (!cancelled) setSettings(normalizeTenantSettings(data));
      })
      .catch(() => {
        if (!cancelled) setSettings(DEFAULT_TENANT_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      settings,
      loading,
      formatCurrency: (value: string | number | null | undefined) => formatTenantCurrency(value, settings),
      formatNumber: (value: string | number | null | undefined, options?: Intl.NumberFormatOptions) =>
        formatTenantNumber(value, settings, options),
      formatDate: (value: Date | string | null | undefined) => formatTenantDate(value, settings),
      formatDateTime: (value: Date | string | null | undefined) => formatTenantDateTime(value, settings),
    }),
    [settings, loading],
  );
}

