'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setStoredLocationId } from '@shared-utils';
import { resolvePublicLocation } from '@/lib/locations-api';

export default function StoreLocationPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = String(params.locationSlug ?? '');

  useEffect(() => {
    if (!slugOrId) {
      router.replace('/catalog');
      return;
    }

    void (async () => {
      try {
        const location = await resolvePublicLocation(slugOrId);
        setStoredLocationId(location.id);
        router.replace('/catalog');
      } catch {
        router.replace('/catalog');
      }
    })();
  }, [slugOrId, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-muted-foreground">
      Loading location…
    </div>
  );
}
