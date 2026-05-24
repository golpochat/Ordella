'use client';

import { useEffect, useState } from 'react';
import { LocationSwitcher } from '@shared-ui';
import {
  resolveActiveLocationId,
  setStoredLocationId,
  type LocationOption,
} from '@shared-utils';
import { getLocationId } from '@/lib/config';

async function fetchKdsLocations(): Promise<LocationOption[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
  const res = await fetch(`${base}/public/locations`, {
    headers: { 'X-Tenant-Id': tenantId },
  });
  if (!res.ok) {
    return [];
  }
  const json = (await res.json()) as { data?: Array<{ id: string; name: string; slug: string }> };
  return (json.data ?? []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
  }));
}

export function FdsLocationSwitcher() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [activeId, setActiveId] = useState<string | null>(getLocationId() || null);

  useEffect(() => {
    void (async () => {
      const options = await fetchKdsLocations();
      setLocations(options);
      const resolved = resolveActiveLocationId(options, getLocationId());
      if (resolved) {
        setActiveId(resolved);
      }
    })();
  }, []);

  return (
    <LocationSwitcher
      locations={locations}
      value={activeId}
      onChange={(id) => {
        setActiveId(id);
        setStoredLocationId(id);
        window.location.reload();
      }}
    />
  );
}
