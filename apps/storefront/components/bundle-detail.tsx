'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent } from '@shared-ui';
import type { OnlineProduct } from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useBasketStore } from '@/stores/basket-store';

export function BundleDetail({ bundle }: { bundle: OnlineProduct }) {
  const { formatCurrency } = useTenantSettings();
  const addItem = useBasketStore((state) => state.addItem);
  const error = useBasketStore((state) => state.error);
  const optionalItems = bundle.bundleItems?.filter((item) => item.isOptional) ?? [];
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<string[]>(
    optionalItems.map((item) => item.itemId),
  );
  const selectedBundleItemIds = useMemo(
    () => selectedOptionalIds.length ? selectedOptionalIds : undefined,
    [selectedOptionalIds],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-2">
            <Badge>Bundle & Save</Badge>
            <h1 className="text-3xl font-bold">{bundle.name}</h1>
            {bundle.description ? <p className="text-muted-foreground">{bundle.description}</p> : null}
            <p className="text-xl font-semibold">{formatCurrency(bundle.price)}</p>
            <p className="text-xs text-muted-foreground">Tax is calculated at checkout based on fulfillment location.</p>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">Included items</h2>
            <div className="mt-3 space-y-2">
              {bundle.bundleItems?.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    {item.isOptional ? (
                      <input
                        type="checkbox"
                        checked={selectedOptionalIds.includes(item.itemId)}
                        onChange={(e) =>
                          setSelectedOptionalIds((current) =>
                            e.target.checked
                              ? [...current, item.itemId]
                              : current.filter((id) => id !== item.itemId),
                          )
                        }
                      />
                    ) : null}
                    <span>{item.name ?? 'Catalog item'}</span>
                  </label>
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.isOptional ? 'optional' : 'included'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="h-12 flex-1"
              onClick={() => addItem(bundle, { selectedBundleItemIds })}
            >
              Add bundle to cart
            </Button>
            <Button asChild type="button" variant="outline" className="h-12">
              <Link href="/catalog">Back to catalog</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
