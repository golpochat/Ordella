'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@shared-ui';
import { browserTokenStorage } from '@/lib/api/browser';

function parseTenantOptions(): { id: string; label: string }[] {
  const raw = process.env.NEXT_PUBLIC_TENANT_OPTIONS ?? '';
  if (!raw.trim()) return [];
  return raw.split(',').map((entry) => {
    const [id, label] = entry.split(':').map((s) => s.trim());
    return { id, label: label || id };
  });
}

export function TenantSwitcher() {
  const router = useRouter();
  const options = parseTenantOptions();
  const current = browserTokenStorage.getTenantId() ?? '';

  async function onChange(tenantId: string) {
    await fetch('/api/auth/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });
    browserTokenStorage.setTenantId(tenantId);
    router.refresh();
  }

  if (options.length > 0) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Tenant</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={current}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
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
        onBlur={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
      />
    </label>
  );
}
