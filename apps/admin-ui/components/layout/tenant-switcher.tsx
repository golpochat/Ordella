'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@shared-ui';
import { getCachedTenantList, getActiveTenantId } from '@shared-utils';
import { browserTokenStorage } from '@/lib/api/browser';
import { loadTenantsForSwitcher, switchActiveTenant, type TenantOption } from '@/lib/api/onboarding';

function parseEnvTenantOptions(): TenantOption[] {
  const raw = process.env.NEXT_PUBLIC_TENANT_OPTIONS ?? '';
  if (!raw.trim()) return [];
  return raw.split(',').map((entry) => {
    const [tenantId, tenantName] = entry.split(':').map((s) => s.trim());
    return {
      tenantId,
      tenantName: tenantName || tenantId,
      slug: null,
      roleId: '',
      roleName: 'unknown',
      isActive: true,
    };
  });
}

export function TenantSwitcher() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [current, setCurrent] = useState(getActiveTenantId(browserTokenStorage) ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTenants(getCachedTenantList());
    void loadTenantsForSwitcher()
      .then(setTenants)
      .catch(() => setTenants(parseEnvTenantOptions()));
  }, []);

  async function onChange(tenantId: string) {
    if (!tenantId) return;
    setLoading(true);
    try {
      await switchActiveTenant(tenantId);
      setCurrent(tenantId);
      router.refresh();
    } catch {
      browserTokenStorage.setTenantId(tenantId);
      setCurrent(tenantId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const options = tenants.length > 0 ? tenants : parseEnvTenantOptions();

  if (options.length > 0) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Tenant</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={current}
          disabled={loading}
          onChange={(e) => void onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((t) => (
            <option key={t.tenantId} value={t.tenantId}>
              {t.tenantName}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Tenant ID</span>
      <Input
        className="h-9 w-56"
        defaultValue={current}
        placeholder="UUID"
        disabled={loading}
        onBlur={(e) => {
          if (e.target.value) void onChange(e.target.value);
        }}
      />
    </label>
  );
}
