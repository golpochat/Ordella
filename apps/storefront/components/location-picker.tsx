'use client';

import { useEffect, useState } from 'react';
import {
  resolveActiveLocationId,
  setStoredLocationId,
  type LocationOption,
} from '@shared-utils';
import { LocationSwitcher } from '@shared-ui';
import { fetchPublicLocations } from '@/lib/locations-api';

export function LocationPicker() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await fetchPublicLocations();
        const options = rows.map((loc) => ({
          id: loc.id,
          name: loc.name,
          slug: loc.slug,
        }));
        setLocations(options);
        const resolved = resolveActiveLocationId(options, null);
        if (resolved) {
          setActiveId(resolved);
          setStoredLocationId(resolved);
        }
      } catch {
        setLocations([]);
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
      label="Shop at"
    />
  );
}
