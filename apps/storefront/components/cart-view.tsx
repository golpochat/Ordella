'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { Button, Card, CardContent, Input } from '@shared-ui';
import { RecommendationSection } from '@/components/recommendation-section';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { basketSubtotal, calculateStorefrontTotals } from '@/lib/storefront-pricing';
import { useBasketStore } from '@/stores/basket-store';

export function CartView() {
  const { settings, formatCurrency } = useTenantSettings();
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
  const totals = calculateStorefrontTotals(subtotal, {
    taxRate: Number(settings.defaultTaxRate) || 23,
    priceMode: 'inclusive',
  });
  const cartProductIds = useMemo(() => lines.map((line) => line.productId), [lines]);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-[var(--theme-spacing)] py-[var(--storefront-section-padding)] text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items from the catalog to get started.</p>
        <Button asChild className="mt-6 h-12 rounded-[var(--storefront-radius)] text-base">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[var(--storefront-container)] gap-[var(--theme-spacing)] px-[var(--theme-spacing)] py-[var(--storefront-section-padding)] lg:grid-cols-[1fr_24rem]">
      <div>
      <h1 className="mb-4 text-3xl font-bold">Cart</h1>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      <div className="space-y-[var(--theme-spacing)]">
        {lines.map((line) => (
          <Card key={line.lineId} className="rounded-[var(--storefront-radius)]">
            <CardContent className="space-y-3 p-[var(--storefront-card-padding)]">
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
                  {line.availableQuantity !== null && line.availableQuantity !== undefined ? (
                    <p className="text-xs text-muted-foreground">
                      Available at this location: {line.availableQuantity}
                    </p>
                  ) : null}
                  <p className="text-sm">{formatCurrency(line.unitPrice)} each</p>
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
                <Button type="button" variant="ghost" className="rounded-[var(--storefront-radius)]" onClick={() => removeLine(line.lineId)}>
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 rounded-[var(--storefront-radius)] text-lg"
                  onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center text-lg">{line.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 rounded-[var(--storefront-radius)] text-lg"
                  disabled={line.availableQuantity !== null && line.availableQuantity !== undefined && line.quantity >= line.availableQuantity}
                  onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Input
                className="rounded-[var(--storefront-radius)]"
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

      </div>

      <aside className="h-fit rounded-[var(--storefront-radius)] border bg-card p-[var(--storefront-card-padding)]">
      <h2 className="mb-3 text-lg font-semibold">Order summary</h2>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.taxBreakdown.map((line) => (
          <div key={line.taxName} className="flex justify-between">
            <span>{line.taxName} ({line.taxRate.toFixed(2)}%, {line.priceMode} est.)</span>
            <span>{formatCurrency(line.taxAmount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-lg font-bold">
          <span>Total (est.)</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button asChild className="h-12 flex-1 rounded-[var(--storefront-radius)] text-base">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
        <Button type="button" variant="outline" className="h-12 rounded-[var(--storefront-radius)]" onClick={clearBasket}>
          Clear cart
        </Button>
      </div>
      </aside>
      <div className="lg:col-span-2">
        <RecommendationSection
          title="Complete your order"
          source="cart_complete_your_order"
          itemIds={cartProductIds}
          mode="cart"
        />
      </div>
    </div>
  );
}
