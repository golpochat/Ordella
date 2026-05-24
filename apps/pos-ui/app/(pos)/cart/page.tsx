'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@shared-ui';
import type { Product } from '@shared-utils';
import { listProducts } from '@/lib/api';
import { CartPanel } from '@/components/cart-panel';

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load products'));
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Cart</h1>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <CartPanel products={products} />
      <div className="mt-6">
        <Button asChild className="h-12 text-base">
          <Link href="/checkout">Continue to checkout</Link>
        </Button>
      </div>
    </div>
  );
}
