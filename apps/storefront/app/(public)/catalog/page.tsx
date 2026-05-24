'use client';

import { Suspense, useEffect, useState } from 'react';
import { CatalogView } from '@/components/catalog-view';
import { fetchPublicMenu, type OnlineMenu } from '@/lib/api';

function CatalogPageInner() {
  const [menu, setMenu] = useState<OnlineMenu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicMenu()
      .then(setMenu)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load catalog'));
  }, []);

  if (error) {
    return <p className="p-6 text-sm text-destructive">{error}</p>;
  }

  if (!menu) {
    return <p className="p-6 text-muted-foreground">Loading catalog…</p>;
  }

  return <CatalogView menu={menu} />;
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<p className="p-6 text-muted-foreground">Loading catalog…</p>}>
      <CatalogPageInner />
    </Suspense>
  );
}
