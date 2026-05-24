'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Product } from '@shared-utils';
import { Button, Card, CardContent } from '@shared-ui';
import { useCartStore } from '@/stores/cart-store';

type PosShellProps = {
  products: Product[];
};

export function PosShell({ products }: PosShellProps) {
  const addItem = useCartStore((s) => s.addItem);
  const lineCount = useCartStore((s) => s.lineCount());
  const syncing = useCartStore((s) => s.syncing);
  const error = useCartStore((s) => s.error);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categoryId).filter(Boolean))) as string[],
    [products],
  );
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const visibleProducts = useMemo(
    () =>
      selectedCategory === 'all'
        ? products
        : products.filter((p) => p.categoryId === selectedCategory),
    [products, selectedCategory],
  );

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-12 gap-4 p-4">
      <aside className="col-span-2 overflow-auto rounded-lg border p-2">
        <Button
          className="mb-2 h-12 w-full justify-start text-base"
          variant={selectedCategory === 'all' ? 'default' : 'ghost'}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {categories.map((categoryId) => (
          <Button
            key={categoryId}
            className="mb-2 h-12 w-full justify-start text-base"
            variant={selectedCategory === categoryId ? 'default' : 'ghost'}
            onClick={() => setSelectedCategory(categoryId)}
          >
            {categoryId.slice(0, 8)}
          </Button>
        ))}
      </aside>

      <section className="col-span-7 overflow-auto">
        <h2 className="mb-3 text-lg font-semibold">Catalog</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <Card key={product.id} className="min-h-36">
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div>
                  <p className="text-lg font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.price}</p>
                  <p className="mt-2 text-xs uppercase text-muted-foreground">{product.status}</p>
                </div>
                <Button
                  className="mt-4 h-12 text-base"
                  disabled={product.status !== 'active' || syncing}
                  onClick={() => addItem(product)}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="col-span-3 rounded-lg border p-4">
        <h2 className="mb-2 text-xl font-semibold">Cart</h2>
        <p className="mb-4 text-sm text-muted-foreground">{lineCount} items</p>
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-3">
          <Button asChild className="h-12 text-base">
            <Link href="/cart">Open cart</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 text-base">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
