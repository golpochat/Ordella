'use client';

import { useEffect, useState } from 'react';
import { PosShell } from '@/components/pos-shell';
import { listPosCatalog, type PosCatalogCategory, type PosCatalogItem } from '@/lib/api';

export default function HomePage() {
  const [categories, setCategories] = useState<PosCatalogCategory[]>([]);
  const [items, setItems] = useState<PosCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPosCatalog()
      .then(({ categories: cats, items: its }) => {
        setCategories(cats);
        setItems(its);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load catalog'));
  }, []);

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }

  return <PosShell categories={categories} items={items} />;
}
