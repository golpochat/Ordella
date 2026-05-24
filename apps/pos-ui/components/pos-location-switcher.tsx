'use client';

import { useEffect, useState } from 'react';
import { LocationSwitcher } from '@shared-ui';
import { resolveActiveLocationId, type LocationOption } from '@shared-utils';
import { fetchPosLocations } from '@/lib/locations';
import { getSession, setSession } from '@/lib/session';

export function PosLocationSwitcher() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const session = getSession();
  const [activeId, setActiveId] = useState(session.locationId || null);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await fetchPosLocations();
        const options = rows.map((loc) => ({ id: loc.id, name: loc.name, slug: loc.slug }));
        setLocations(options);
        const resolved = resolveActiveLocationId(options, session.locationId);
        if (resolved && resolved !== session.locationId) {
          setActiveId(resolved);
          setSession({ ...session, locationId: resolved });
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
        setSession({ ...getSession(), locationId: id });
        window.location.reload();
      }}
      label="Site"
    />
  );
}
