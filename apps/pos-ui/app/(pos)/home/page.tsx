'use client';

import { useEffect, useState } from 'react';
import { PosShell } from '@/components/pos-shell';
import { listProducts } from '@/lib/api';
import type { Product } from '@shared-utils';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load products'));
  }, []);

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }

  return <PosShell products={products} />;
}
