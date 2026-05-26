'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PosCatalogCategory, PosCatalogItem } from '@/lib/api';
import { listPosCatalog, searchPosItems } from '@/lib/api';
import { loadCatalogCache, saveCatalogCache } from '@/lib/catalog-cache';
import { getSession } from '@/lib/session';
import {
  countPendingOfflineOrders,
  DEFAULT_OFFLINE_SETTINGS,
  loadOfflineBootstrap,
  loadOfflineSettings,
  type OfflineModeSettings,
} from '@/lib/offline-db';
import {
  hasPendingOfflineWork,
  recordConnectivityEvent,
  refreshOfflineBootstrap,
  syncPendingOfflineWork,
} from '@/lib/offline-sync';
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
import { useTenantSettings } from '@/hooks/use-tenant-settings';
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
  const { formatCurrency } = useTenantSettings();
  const setCatalog = useCartStore((s) => s.setCatalog);
  const addCatalogItem = useCartStore((s) => s.addCatalogItem);
  const cartSyncing = useCartStore((s) => s.syncing);
  const hydrateOfflineCart = useCartStore((s) => s.hydrateOfflineCart);

  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [semanticItemIds, setSemanticItemIds] = useState<string[] | null>(null);
  const [suggestionIds, setSuggestionIds] = useState<string[]>([]);
  const [pickerItem, setPickerItem] = useState<PosCatalogItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [offlineSettings, setOfflineSettings] = useState<OfflineModeSettings>(DEFAULT_OFFLINE_SETTINGS);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    setCatalog(items);
  }, [items, setCatalog]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void recordConnectivityEvent(true);
    };
    const onOffline = () => {
      setOnline(false);
      void recordConnectivityEvent(false);
    };
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    void hydrateOfflineCart();
    void loadOfflineSettings().then(setOfflineSettings);
    void countPendingOfflineOrders().then(setPendingOrders);
  }, [hydrateOfflineCart]);

  const syncOfflineQueue = useCallback(async () => {
    if (!navigator.onLine || syncingOffline) return;

    try {
      const settings = await loadOfflineSettings();
      setOfflineSettings(settings);
      const count = await countPendingOfflineOrders();
      setPendingOrders(count);
      if (!settings.enabled || !(await hasPendingOfflineWork())) {
        return;
      }

      setSyncingOffline(true);
      const summary = await syncPendingOfflineWork(settings);
      setPendingOrders(await countPendingOfflineOrders());
      if (summary.synced > 0 || summary.requiresReview > 0 || summary.failed > 0) {
        setSyncMessage(
          `Synced ${summary.synced} offline order(s). ${summary.requiresReview} need review, ${summary.failed} failed.`,
        );
      }
    } finally {
      setSyncingOffline(false);
    }
  }, [syncingOffline]);

  useEffect(() => {
    if (!online) return;
    void syncOfflineQueue();
  }, [online, syncOfflineQueue]);

  useEffect(() => {
    if (!online || !offlineSettings.enabled) return;
    const interval = window.setInterval(() => {
      void syncOfflineQueue();
      void countPendingOfflineOrders().then(setPendingOrders);
    }, Math.max(5, offlineSettings.autoSyncIntervalSeconds) * 1000);
    return () => window.clearInterval(interval);
  }, [offlineSettings, online, syncOfflineQueue]);

  const refreshCatalog = useCallback(async () => {
    try {
      const bootstrap = await refreshOfflineBootstrap();
      const catalog = { categories: bootstrap.categories, items: bootstrap.items };
      setCategories(catalog.categories);
      setItems(catalog.items);
      saveCatalogCache({
        categories: catalog.categories,
        items: catalog.items,
        cachedAt: new Date().toISOString(),
      });
    } catch {
      const bootstrap = await loadOfflineBootstrap();
      const cached = loadCatalogCache();
      if (bootstrap) {
        setCategories(bootstrap.categories);
        setItems(bootstrap.items);
      } else if (cached) {
        setCategories(cached.categories);
        setItems(cached.items);
      } else {
        const session = getSession();
        const catalog = await listPosCatalog(session.locationId || undefined);
        setCategories(catalog.categories);
        setItems(catalog.items);
      }
    }
  }, []);

  useEffect(() => {
    if (!online) {
      void loadOfflineBootstrap().then((bootstrap) => {
        const cached = loadCatalogCache();
        if (bootstrap) {
          setCategories(bootstrap.categories);
          setItems(bootstrap.items);
          setOfflineSettings(bootstrap.settings);
        } else if (cached) {
          setCategories(cached.categories);
          setItems(cached.items);
        }
      });
    }
  }, [online]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    let list = items.filter((item) => {
      if (!item.isActive) return false;
      if (!isInStock(item) && !offlineSettings.allowOutOfStockOfflineSales) return false;
      if (inStockOnly && !isInStock(item)) return false;
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      const price = Number.parseFloat(item.price);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      if (semanticItemIds && !semanticItemIds.includes(item.id)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false)
      );
    });
    if (semanticItemIds) {
      list = [...list].sort((a, b) => semanticItemIds.indexOf(a.id) - semanticItemIds.indexOf(b.id));
    }
    return list;
  }, [
    inStockOnly,
    items,
    offlineSettings.allowOutOfStockOfflineSales,
    priceMax,
    priceMin,
    selectedCategory,
    semanticItemIds,
    search,
  ]);

  const tryBarcodeAdd = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return false;
    const match = items.find(
      (item) =>
        item.isActive &&
        (isInStock(item) || offlineSettings.allowOutOfStockOfflineSales) &&
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
    setSemanticItemIds(null);
    if (e.key === 'Enter') {
      e.preventDefault();
      tryBarcodeAdd(search);
    }
  };

  const runSemanticSearch = async () => {
    const q = search.trim();
    if (!q || !online) return;
    try {
      const result = await searchPosItems({
        q,
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        inStockOnly,
        semantic: true,
      });
      setSemanticItemIds(result.results.map((entry) => entry.entityId));
      setSyncMessage(`AI search ranked ${result.total} product result(s).`);
    } catch {
      setSemanticItemIds(null);
    }
  };

  useEffect(() => {
    const q = search.trim();
    if (!online || q.length < 2) {
      setSuggestionIds([]);
      return;
    }
    const timeout = window.setTimeout(() => {
      void searchPosItems({
        q,
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        inStockOnly: true,
        limit: 6,
      })
        .then((result) => setSuggestionIds(result.results.map((entry) => entry.entityId)))
        .catch(() => setSuggestionIds([]));
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [online, search, selectedCategory]);

  const suggestions = useMemo(
    () => suggestionIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is PosCatalogItem => Boolean(item)),
    [items, suggestionIds],
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
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <PosTopBar online={online} syncing={syncingOffline} pendingOrders={pendingOrders} />
      {!online ? (
        <p className="bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
          You are offline — orders will sync automatically when connection returns.
        </p>
      ) : null}
      {syncMessage ? (
        <p className="bg-muted px-4 py-1 text-center text-sm text-muted-foreground">{syncMessage}</p>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-[var(--pos-density-gap)] border-b bg-card p-[var(--pos-panel-padding)]">
            <Input
              className="h-[var(--pos-button-height)] min-w-64 max-w-md flex-1 rounded-[var(--pos-radius)] text-base"
              placeholder="Search name, SKU, or scan barcode…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSemanticItemIds(null);
              }}
              onKeyDown={onSearchKeyDown}
            />
            <Input
              className="h-[var(--pos-button-height)] w-28 rounded-[var(--pos-radius)]"
              type="number"
              min={0}
              placeholder="Min price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <Input
              className="h-[var(--pos-button-height)] w-28 rounded-[var(--pos-radius)]"
              type="number"
              min={0}
              placeholder="Max price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
            <label className="flex h-[var(--pos-button-height)] items-center gap-2 rounded-[var(--pos-radius)] border px-3 text-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock
            </label>
            <Button type="button" variant="outline" className="h-[var(--pos-button-height)] rounded-[var(--pos-radius)]" disabled={!online || !search.trim()} onClick={() => void runSemanticSearch()}>
              AI search
            </Button>
            <Button type="button" variant="outline" className="h-[var(--pos-button-height)] rounded-[var(--pos-radius)]" onClick={() => void refreshCatalog()}>
              Refresh catalog
            </Button>
          </div>
          {suggestions.length ? (
            <div className="flex flex-wrap gap-2 border-b bg-muted/40 px-[var(--pos-panel-padding)] py-2">
              {suggestions.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-[var(--pos-radius)]"
                  onClick={() => {
                    setSearch(item.name);
                    setSemanticItemIds([item.id]);
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <nav className="flex shrink-0 gap-2 overflow-x-auto border-b p-2 lg:w-44 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <Button
                type="button"
                className="h-[var(--pos-button-height)] shrink-0 justify-start rounded-[var(--pos-radius)] text-base lg:w-full"
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  className="h-[var(--pos-button-height)] shrink-0 justify-start rounded-[var(--pos-radius)] text-base lg:w-full"
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </nav>

            <div className="min-w-0 flex-1 overflow-y-auto p-[var(--pos-panel-padding)]">
              <h2 className="mb-3 text-lg font-semibold">Catalog</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--pos-grid-min),1fr))] gap-[var(--pos-density-gap)]">
                {visibleItems.map((item) => (
                  <Card key={item.id} className="min-h-36 rounded-[var(--pos-radius)] transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col justify-between p-[var(--pos-panel-padding)]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold leading-tight">{item.name}</p>
                          {item.itemType === 'bundle' ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Bundle
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-lg font-semibold text-primary">{formatCurrency(item.price)}</p>
                        {item.bundleItems?.length ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.bundleItems.map((bundleItem) => bundleItem.name).filter(Boolean).join(', ')}
                          </p>
                        ) : null}
                        {item.sku ? (
                          <p className="mt-1 text-xs text-muted-foreground">SKU {item.sku}</p>
                        ) : null}
                        {isLowStock(item) ? (
                          <p className="mt-1 text-xs font-medium text-destructive">Low stock</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        className="mt-3 h-[var(--pos-button-height)] rounded-[var(--pos-radius)] text-base"
                        disabled={cartSyncing}
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

        <div className="min-h-0 w-full shrink-0 border-t lg:max-w-md lg:border-l lg:border-t-0 xl:max-w-lg">
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
                    {variant.name} (+{formatCurrency(variant.priceDelta)})
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          {pickerItem?.modifiers.map((modifier) => (
            <div key={modifier.id} className="space-y-2 rounded-[var(--pos-radius)] border p-[var(--pos-panel-padding)]">
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
                    {option.priceDelta !== '0' ? ` (+${formatCurrency(option.priceDelta)})` : ''}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button type="button" className="h-[var(--pos-button-height)] w-full rounded-[var(--pos-radius)]" disabled={!canAdd || cartSyncing} onClick={confirmAdd}>
            Add to cart
          </Button>
        </ModalContent>
      </Modal>
    </div>
  );
}
