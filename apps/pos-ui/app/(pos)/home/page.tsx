'use client';

import { useEffect, useState } from 'react';
import { PosRegister } from '@/components/pos-register';
import { loadCatalogCache, saveCatalogCache } from '@/lib/catalog-cache';
import { listPosCatalog, type PosCatalogCategory, type PosCatalogItem } from '@/lib/api';
import { getSession } from '@/lib/session';

export default function HomePage() {
  const [categories, setCategories] = useState<PosCatalogCategory[]>([]);
  const [items, setItems] = useState<PosCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cached = loadCatalogCache();
    if (cached) {
      setCategories(cached.categories);
      setItems(cached.items);
      setReady(true);
    }

    const { locationId } = getSession();
    listPosCatalog(locationId || undefined)
      .then((catalog) => {
        setCategories(catalog.categories);
        setItems(catalog.items);
        saveCatalogCache({
          categories: catalog.categories,
          items: catalog.items,
          cachedAt: new Date().toISOString(),
        });
        setError(null);
      })
      .catch((e) => {
        if (!cached) {
          setError(e instanceof Error ? e.message : 'Failed to load catalog');
        }
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready && !error) {
    return <div className="p-6 text-sm text-muted-foreground">Loading catalog…</div>;
  }

  if (error && items.length === 0) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }

  return <PosRegister initialCategories={categories} initialItems={items} />;
}
