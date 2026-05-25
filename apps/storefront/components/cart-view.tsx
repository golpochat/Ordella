'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button, Card, CardContent, Input } from '@shared-ui';
import { basketSubtotal, calculateStorefrontTotals, formatMoney } from '@/lib/storefront-pricing';
import { useBasketStore } from '@/stores/basket-store';

export function CartView() {
  const lines = useBasketStore((s) => s.lines);
  const hydrate = useBasketStore((s) => s.hydrate);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeLine = useBasketStore((s) => s.removeLine);
  const setLineNotes = useBasketStore((s) => s.setLineNotes);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const error = useBasketStore((s) => s.error);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const subtotal = basketSubtotal(lines);
  const totals = calculateStorefrontTotals(subtotal);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items from the catalog to get started.</p>
        <Button asChild className="mt-6 h-12 text-base">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Cart</h1>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      <div className="space-y-3">
        {lines.map((line) => (
          <Card key={line.lineId}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{line.name}</p>
                  {line.variantName ? (
                    <p className="text-xs text-muted-foreground">{line.variantName}</p>
                  ) : null}
                  {line.modifierLabels.length ? (
                    <p className="text-xs text-muted-foreground">
                      {line.modifierLabels.join(', ')}
                    </p>
                  ) : null}
                  {line.sku ? (
                    <p className="text-xs text-muted-foreground">SKU {line.sku}</p>
                  ) : null}
                  <p className="text-sm">${formatMoney(line.unitPrice)} each</p>
                  {line.purchaseType === 'subscription' ? (
                    <p className="text-xs font-medium text-primary">
                      Recurring order: {line.subscriptionSchedule === 'biweekly' ? 'every 2 weeks' : line.subscriptionSchedule}
                    </p>
                  ) : null}
                  {line.bundleId && line.bundleItems?.length ? (
                    <details className="mt-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-medium text-foreground">Bundle contents</summary>
                      <div className="mt-1 space-y-1">
                        {line.bundleItems
                          .filter((item) => !item.isOptional || !line.selectedBundleItemIds || line.selectedBundleItemIds.includes(item.itemId))
                          .map((item) => (
                          <p key={item.itemId}>{item.quantity}x {item.name ?? 'Catalog item'}</p>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
                <Button type="button" variant="ghost" onClick={() => removeLine(line.lineId)}>
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 text-lg"
                  onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center text-lg">{line.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 text-lg"
                  onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Input
                placeholder="Note for this item (optional)"
                defaultValue={line.notes ?? ''}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value !== (line.notes ?? '')) {
                    setLineNotes(line.lineId, value);
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-1 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${formatMoney(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (est.)</span>
          <span>${formatMoney(totals.tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total (est.)</span>
          <span>${formatMoney(totals.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-12 flex-1 text-base">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
        <Button type="button" variant="outline" className="h-12" onClick={clearBasket}>
          Clear cart
        </Button>
      </div>
    </div>
  );
}
