'use client';

import { useEffect, useState } from 'react';
import { LocationSwitcher } from '@shared-ui';
import { resolveActiveLocationId, type LocationOption } from '@shared-utils';
import { getSession, setSession } from '@/lib/session';

export function PosLocationSwitcher() {
  const session = getSession();
  const [locations] = useState<LocationOption[]>(
    session.locationId ? [{ id: session.locationId, name: 'Current location' }] : [],
  );
  const [activeId, setActiveId] = useState(session.locationId || null);

  useEffect(() => {
    const resolved = resolveActiveLocationId(locations, session.locationId);
    if (resolved && resolved !== session.locationId) {
      setActiveId(resolved);
      setSession({ ...session, locationId: resolved });
    }
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
