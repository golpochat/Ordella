'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent } from '@shared-ui';
import { fetchPublicMenu, type OnlineProduct } from '@/lib/api';
import { useBasketStore } from '@/stores/basket-store';

export function BasketView() {
  const items = useBasketStore((s) => s.items);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const error = useBasketStore((s) => s.error);

  const [products, setProducts] = useState<OnlineProduct[]>([]);

  useEffect(() => {
    fetchPublicMenu()
      .then((menu) => setProducts(menu.products))
      .catch(() => setProducts([]));
  }, []);

  const lines = useMemo(
    () =>
      items.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        return {
          ...line,
          name: product?.name ?? line.productId,
          price: Number(product?.price ?? 0),
        };
      }),
    [items, products],
  );

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Your basket is empty.</p>
        <Button asChild className="mt-4 h-12">
          <Link href="/menu">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Basket</h1>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <div className="space-y-3">
        {lines.map((line) => (
          <Card key={line.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{line.name}</p>
                <p className="text-sm text-muted-foreground">${line.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-11 w-11"
                  variant="outline"
                  onClick={() => updateQuantity(line.id, line.quantity - 1)}
                >
                  -
                </Button>
                <span className="w-8 text-center">{line.quantity}</span>
                <Button
                  className="h-11 w-11"
                  variant="outline"
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                >
                  +
                </Button>
                <Button variant="ghost" onClick={() => removeItem(line.id)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Estimated total</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>
      <div className="mt-6 flex gap-2">
        <Button asChild className="h-12 flex-1 text-base">
          <Link href="/checkout">Checkout</Link>
        </Button>
        <Button variant="outline" className="h-12" onClick={clearBasket}>
          Clear
        </Button>
      </div>
    </div>
  );
}
