'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PosCatalogCategory, PosCatalogItem } from '@/lib/api';
import { completeSale, listPosCatalog } from '@/lib/api';
import { loadCatalogCache, saveCatalogCache } from '@/lib/catalog-cache';
import { getSession } from '@/lib/session';
import { listOfflineSales, removeOfflineSale } from '@/lib/offline-queue';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@shared-ui';
import { PosCartSidebar } from '@/components/pos-cart-sidebar';
import { PosCheckoutModal } from '@/components/pos-checkout-modal';
import { PosTopBar } from '@/components/pos-top-bar';
import { useCartStore } from '@/stores/cart-store';

type PosRegisterProps = {
  initialCategories: PosCatalogCategory[];
  initialItems: PosCatalogItem[];
};

function isInStock(item: PosCatalogItem): boolean {
  if (item.isOutOfStock) return false;
  if (!item.inventoryTrackingEnabled) return true;
  return item.stockLevel === null || item.stockLevel === undefined || item.stockLevel > 0;
}

function isLowStock(item: PosCatalogItem): boolean {
  return item.stockStatus === 'low';
}

export function PosRegister({ initialCategories, initialItems }: PosRegisterProps) {
  const setCatalog = useCartStore((s) => s.setCatalog);
  const addCatalogItem = useCartStore((s) => s.addCatalogItem);
  const syncing = useCartStore((s) => s.syncing);

  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [pickerItem, setPickerItem] = useState<PosCatalogItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    setCatalog(items);
  }, [items, setCatalog]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    const queued = listOfflineSales();
    if (!queued.length || !navigator.onLine) return;
    let synced = 0;
    for (const entry of queued) {
      try {
        await completeSale(entry.payload);
        removeOfflineSale(entry.id);
        synced += 1;
      } catch {
        break;
      }
    }
    if (synced > 0) {
      setSyncMessage(`Synced ${synced} offline order(s).`);
    }
  }, []);

  useEffect(() => {
    if (!online) return;
    void syncOfflineQueue();
  }, [online, syncOfflineQueue]);

  const refreshCatalog = useCallback(async () => {
    try {
      const session = getSession();
      const catalog = await listPosCatalog(session.locationId || undefined);
      setCategories(catalog.categories);
      setItems(catalog.items);
      saveCatalogCache({
        categories: catalog.categories,
        items: catalog.items,
        cachedAt: new Date().toISOString(),
      });
    } catch {
      const cached = loadCatalogCache();
      if (cached) {
        setCategories(cached.categories);
        setItems(cached.items);
      }
    }
  }, []);

  useEffect(() => {
    if (!online) {
      const cached = loadCatalogCache();
      if (cached) {
        setCategories(cached.categories);
        setItems(cached.items);
      }
    }
  }, [online]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.isActive || !isInStock(item)) return false;
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, selectedCategory, search]);

  const tryBarcodeAdd = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return false;
    const match = items.find(
      (item) =>
        item.isActive &&
        isInStock(item) &&
        (item.barcode === trimmed ||
          item.sku === trimmed ||
          item.variants.some((v) => v.sku === trimmed)),
    );
    if (!match) return false;
    if (match.variants.length || match.modifiers.length) {
      openPicker(match);
      return true;
    }
    void addCatalogItem(match, {});
    setSearch('');
    return true;
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryBarcodeAdd(search);
    }
  };

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
    await addCatalogItem(pickerItem, {
      variantId: selectedVariantId,
      modifierOptionIds: selectedOptions.length ? selectedOptions : undefined,
    });
    setPickerItem(null);
  };

  const tapItem = (item: PosCatalogItem) => {
    if (item.variants.length || item.modifiers.length) {
      openPicker(item);
      return;
    }
    void addCatalogItem(item, {});
  };

  return (
    <div className="flex h-screen flex-col">
      <PosTopBar online={online} />
      {syncMessage ? (
        <p className="bg-muted px-4 py-1 text-center text-sm text-muted-foreground">{syncMessage}</p>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b p-3">
            <Input
              className="h-12 max-w-md flex-1 text-base"
              placeholder="Search name, SKU, or scan barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />
            <Button type="button" variant="outline" className="h-12" onClick={() => void refreshCatalog()}>
              Refresh catalog
            </Button>
          </div>

          <div className="flex min-h-0 flex-1">
            <nav className="w-36 shrink-0 overflow-y-auto border-r p-2 md:w-44">
              <Button
                type="button"
                className="mb-2 h-12 w-full justify-start text-base"
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  className="mb-2 h-12 w-full justify-start text-base"
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </nav>

            <div className="min-w-0 flex-1 overflow-y-auto p-4">
              <h2 className="mb-3 text-lg font-semibold">Catalog</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <Card key={item.id} className="min-h-32">
                    <CardContent className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold leading-tight">{item.name}</p>
                          {item.itemType === 'bundle' ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Bundle
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">${item.price}</p>
                        {item.bundleItems?.length ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.bundleItems.map((bundleItem) => bundleItem.name).filter(Boolean).join(', ')}
                          </p>
                        ) : null}
                        {item.sku ? (
                          <p className="mt-1 text-xs text-muted-foreground">SKU {item.sku}</p>
                        ) : null}
                        {isLowStock(item) ? (
                          <p className="mt-1 text-xs font-medium text-amber-600">Low stock</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        className="mt-3 h-12 text-base"
                        disabled={syncing}
                        onClick={() => tapItem(item)}
                      >
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {visibleItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items match your filters.</p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="w-full max-w-md shrink-0">
          <PosCartSidebar onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      <PosCheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} online={online} />

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
          <Button type="button" className="h-12 w-full" disabled={!canAdd || syncing} onClick={confirmAdd}>
            Add to cart
          </Button>
        </ModalContent>
      </Modal>
    </div>
  );
}
