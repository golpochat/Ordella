'use client';

import { useCallback, useEffect, useState } from 'react';
import { LocationSwitcher } from '@shared-ui';
import {
  getStoredLocationId,
  resolveActiveLocationId,
  setStoredLocationId,
  type LocationOption,
} from '@shared-utils';
import { fetchLocations } from '@/lib/api/locations';

export function LocationSwitcherBar() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await fetchLocations();
      const options = rows.map((loc) => ({
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
      }));
      setLocations(options);
      const resolved = resolveActiveLocationId(options, getStoredLocationId());
      if (resolved) {
        setActiveId(resolved);
        setStoredLocationId(resolved);
      }
    } catch {
      setLocations([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <LocationSwitcher
      locations={locations}
      value={activeId}
      onChange={setActiveId}
      label="Site"
    />
  );
}
