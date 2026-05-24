'use client';

import { useMemo } from 'react';
import type { Product } from '@shared-utils';
import { Button, Card, CardContent } from '@shared-ui';
import { useCartStore } from '@/stores/cart-store';

export function CartPanel({ products }: { products: Product[] }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          ...item,
          name: product?.name ?? item.productId,
          price: Number(product?.price ?? 0),
        };
      }),
    [items, products],
  );

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">Cart is empty.</p>;
  }

  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <Card key={line.productId}>
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-muted-foreground">${line.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="h-12 w-12 text-lg" variant="outline" onClick={() => updateQuantity(line.productId, line.quantity - 1)}>
                -
              </Button>
              <span className="w-8 text-center text-lg">{line.quantity}</span>
              <Button className="h-12 w-12 text-lg" variant="outline" onClick={() => updateQuantity(line.productId, line.quantity + 1)}>
                +
              </Button>
              <Button className="h-12" variant="ghost" onClick={() => removeItem(line.productId)}>
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>
      <Button variant="outline" className="h-12 w-full" onClick={clearCart}>
        Clear cart
      </Button>
    </div>
  );
}
