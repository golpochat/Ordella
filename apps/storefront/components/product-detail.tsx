'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { isProductOrderable, type OnlineProduct } from '@/lib/api';
import { useBasketStore } from '@/stores/basket-store';

export function ProductDetail({ product }: { product: OnlineProduct }) {
  const router = useRouter();
  const addItem = useBasketStore((s) => s.addItem);
  const syncing = useBasketStore((s) => s.syncing);
  const error = useBasketStore((s) => s.error);
  const orderable = isProductOrderable(product);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const requiredModifiers = useMemo(
    () => product.modifiers.filter((m) => m.required),
    [product.modifiers],
  );

  const toggleOption = (optionId: string, modifierId: string, multi: boolean) => {
    setSelectedOptions((prev) => {
      if (multi) {
        return prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];
      }
      const withoutGroup = prev.filter(
        (id) => !product.modifiers.find((m) => m.id === modifierId)?.options.some((o) => o.id === id),
      );
      return [...withoutGroup, optionId];
    });
  };

  const canAdd =
    orderable &&
    requiredModifiers.every((modifier) =>
      modifier.options.some((option) => selectedOptions.includes(option.id)),
    );

  const onAdd = async () => {
    await addItem(product, selectedOptions.length ? selectedOptions : undefined);
    router.push('/basket');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.description ? <p className="text-muted-foreground">{product.description}</p> : null}
          <p className="text-xl font-semibold">${product.price}</p>
          {!orderable ? <Badge variant="secondary">Out of stock</Badge> : null}

          {product.modifiers.map((modifier) => (
            <div key={modifier.id} className="space-y-2 rounded-md border p-3">
              <p className="font-medium">
                {modifier.name}
                {modifier.required ? <span className="text-destructive"> *</span> : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {modifier.options.map((option) => {
                  const active = selectedOptions.includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      className="h-11"
                      onClick={() => toggleOption(option.id, modifier.id, modifier.type !== 'single')}
                    >
                      {option.name}
                      {option.priceDelta !== '0' ? ` (+$${option.priceDelta})` : ''}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="h-12 w-full text-base" disabled={!canAdd || syncing} onClick={onAdd}>
            Add to basket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
