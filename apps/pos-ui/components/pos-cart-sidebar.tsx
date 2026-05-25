'use client';

import { useMemo, useState } from 'react';
import { Button, Input } from '@shared-ui';
import { calculatePosTotals, formatMoney } from '@/lib/pos-pricing';
import { cartLineKey, useCartStore } from '@/stores/cart-store';

type PosCartSidebarProps = {
  onCheckout: () => void;
};

export function PosCartSidebar({ onCheckout }: PosCartSidebarProps) {
  const lines = useCartStore((s) => s.lines);
  const syncing = useCartStore((s) => s.syncing);
  const error = useCartStore((s) => s.error);
  const discountPercent = useCartStore((s) => s.discountPercent);
  const discountFixed = useCartStore((s) => s.discountFixed);
  const setDiscountPercent = useCartStore((s) => s.setDiscountPercent);
  const setDiscountFixed = useCartStore((s) => s.setDiscountFixed);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const setLineNotes = useCartStore((s) => s.setLineNotes);
  const subtotalFn = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [noteLineKey, setNoteLineKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const subtotal = subtotalFn();
  const totals = useMemo(
    () =>
      calculatePosTotals({
        subtotal,
        discountPercent,
        discountFixed,
      }),
    [subtotal, discountPercent, discountFixed],
  );

  const saveNotes = async () => {
    if (!noteLineKey) return;
    await setLineNotes(noteLineKey, noteDraft);
    setNoteLineKey(null);
    setNoteDraft('');
  };

  return (
    <aside className="flex h-full flex-col border-l bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-semibold">Cart</h2>
        <p className="text-sm text-muted-foreground">
          {lines.reduce((n, l) => n + l.quantity, 0)} items
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cart is empty. Add items from the catalog.</p>
        ) : null}
        {lines.map((line) => {
          const key = cartLineKey(line);
          return (
            <div key={key} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{line.name}</p>
                  {line.variantName ? (
                    <p className="text-xs text-muted-foreground">{line.variantName}</p>
                  ) : null}
                  {line.modifierLabels.length ? (
                    <p className="text-xs text-muted-foreground">{line.modifierLabels.join(', ')}</p>
                  ) : null}
                  {line.stockLevel !== null && line.stockLevel !== undefined ? (
                    <p className="text-xs text-muted-foreground">
                      Available at this location: {line.stockLevel}
                    </p>
                  ) : null}
                  {line.sku ? (
                    <p className="text-xs text-muted-foreground">SKU {line.sku}</p>
                  ) : null}
                  <p className="text-sm">${formatMoney(line.unitPrice)} each</p>
                  {line.bundleId && line.bundleItems?.length ? (
                    <details className="mt-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-medium text-foreground">Bundle breakdown</summary>
                      <div className="mt-1 space-y-1">
                        {line.bundleItems.map((item) => (
                          <p key={item.itemId}>{item.quantity}x {item.name ?? 'Catalog item'}</p>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 shrink-0"
                  disabled={syncing || (line.stockLevel !== null && line.stockLevel !== undefined && line.quantity >= line.stockLevel)}
                  onClick={() => removeLine(key)}
                >
                  Remove
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 text-lg"
                  disabled={syncing}
                  onClick={() => updateQuantity(key, line.quantity - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center text-lg">{line.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 text-lg"
                  disabled={syncing}
                  onClick={() => updateQuantity(key, line.quantity + 1)}
                >
                  +
                </Button>
              </div>
              {line.notes ? (
                <p className="mt-2 text-xs text-muted-foreground">Note: {line.notes}</p>
              ) : null}
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-xs"
                onClick={() => {
                  setNoteLineKey(key);
                  setNoteDraft(line.notes ?? '');
                }}
              >
                {line.notes ? 'Edit note' : 'Add note'}
              </Button>
            </div>
          );
        })}
      </div>

      {noteLineKey ? (
        <div className="space-y-2 border-t p-4">
          <Input
            placeholder="Line note"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" className="h-11 flex-1" onClick={saveNotes} disabled={syncing}>
              Save note
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setNoteLineKey(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 border-t p-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Discount %"
            value={discountPercent || ''}
            onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="Discount $"
            value={discountFixed || ''}
            onChange={(e) => setDiscountFixed(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${formatMoney(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>−${formatMoney(totals.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${formatMoney(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${formatMoney(totals.total)}</span>
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          type="button"
          className="h-12 w-full text-base"
          disabled={syncing || lines.length === 0}
          onClick={onCheckout}
        >
          Checkout
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          disabled={syncing || lines.length === 0}
          onClick={clearCart}
        >
          Clear cart
        </Button>
      </div>
    </aside>
  );
}
