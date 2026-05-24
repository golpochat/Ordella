'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PosCatalogCategory, PosCatalogItem } from '@/lib/api';
import { Button, Card, CardContent, Modal, ModalContent, ModalHeader, ModalTitle } from '@shared-ui';
import { useCartStore } from '@/stores/cart-store';

type PosShellProps = {
  categories: PosCatalogCategory[];
  items: PosCatalogItem[];
};

function isInStock(item: PosCatalogItem): boolean {
  if (!item.inventoryTrackingEnabled) return true;
  return item.stockLevel === null || item.stockLevel === undefined || item.stockLevel > 0;
}

export function PosShell({ categories, items }: PosShellProps) {
  const addItem = useCartStore((s) => s.addItem);
  const lineCount = useCartStore((s) => s.lineCount);
  const syncing = useCartStore((s) => s.syncing);
  const error = useCartStore((s) => s.error);

  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [pickerItem, setPickerItem] = useState<PosCatalogItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (!item.isActive || !isInStock(item)) return false;
        if (selectedCategory === 'all') return true;
        return item.categoryId === selectedCategory;
      }),
    [items, selectedCategory],
  );

  const openPicker = (item: PosCatalogItem) => {
    setPickerItem(item);
    setSelectedVariantId(item.variants[0]?.id);
    setSelectedOptions([]);
  };

  const toggleOption = (optionId: string, modifierId: string, multi: boolean) => {
    setSelectedOptions((prev) => {
      if (multi) {
        return prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId];
      }
      const withoutGroup = prev.filter(
        (id) =>
          !pickerItem?.modifiers
            .find((m) => m.id === modifierId)
            ?.options.some((o) => o.id === id),
      );
      return [...withoutGroup, optionId];
    });
  };

  const canAdd =
    pickerItem &&
    pickerItem.modifiers
      .filter((m) => m.required)
      .every((m) => m.options.some((o) => selectedOptions.includes(o.id)));

  const confirmAdd = async () => {
    if (!pickerItem) return;
    const product = {
      id: pickerItem.id,
      tenantId: '',
      name: pickerItem.name,
      price: pickerItem.price,
      status: 'active' as const,
      sortOrder: 0,
    };
    await addItem(product, {
      variantId: selectedVariantId,
      modifierOptionIds: selectedOptions.length ? selectedOptions : undefined,
    });
    setPickerItem(null);
  };

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
        {categories.map((category) => (
          <Button
            key={category.id}
            className="mb-2 h-12 w-full justify-start text-base"
            variant={selectedCategory === category.id ? 'default' : 'ghost'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </aside>

      <section className="col-span-7 overflow-auto">
        <h2 className="mb-3 text-lg font-semibold">Catalog</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <Card key={item.id} className="min-h-36">
              <CardContent className="flex h-full flex-col justify-between p-4">
                <div>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.price}</p>
                  {item.sku ? (
                    <p className="mt-1 text-xs text-muted-foreground">SKU {item.sku}</p>
                  ) : null}
                </div>
                <Button
                  className="mt-4 h-12 text-base"
                  disabled={syncing}
                  onClick={() =>
                    item.variants.length || item.modifiers.length
                      ? openPicker(item)
                      : addItem(
                          {
                            id: item.id,
                            tenantId: '',
                            name: item.name,
                            price: item.price,
                            status: 'active',
                            sortOrder: 0,
                          },
                          {},
                        )
                  }
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
        <p className="mb-4 text-sm text-muted-foreground">{lineCount()} items</p>
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

      <Modal open={!!pickerItem} onOpenChange={(open) => !open && setPickerItem(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{pickerItem?.name}</ModalTitle>
          </ModalHeader>
          {pickerItem?.variants.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Variant</p>
              <div className="flex flex-wrap gap-2">
                {pickerItem.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariantId === variant.id ? 'default' : 'outline'}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.name} (+{variant.priceDelta})
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          {pickerItem?.modifiers.map((modifier) => (
            <div key={modifier.id} className="space-y-2 rounded-md border p-3">
              <p className="font-medium">
                {modifier.name}
                {modifier.required ? <span className="text-destructive"> *</span> : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {modifier.options.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={selectedOptions.includes(option.id) ? 'default' : 'outline'}
                    onClick={() =>
                      toggleOption(option.id, modifier.id, modifier.type !== 'single')
                    }
                  >
                    {option.name}
                    {option.priceDelta !== '0' ? ` (+${option.priceDelta})` : ''}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button className="h-12 w-full" disabled={!canAdd || syncing} onClick={confirmAdd}>
            Add to cart
          </Button>
        </ModalContent>
      </Modal>
    </div>
  );
}
