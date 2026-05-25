'use client';

import { create } from 'zustand';
import { clearBasketStorage, loadBasket, saveBasket } from '@/lib/basket-storage';
import { isProductOrderable, type OnlineProduct } from '@/lib/api';

export type BasketLineMeta = {
  lineId: string;
  productId: string;
  variantId?: string;
  bundleId?: string;
  selectedBundleItemIds?: string[];
  modifierOptionIds?: string[];
  name: string;
  variantName?: string;
  modifierLabels: string[];
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  notes?: string;
  bundleItems?: Array<{ itemId: string; name?: string; quantity: number; isOptional?: boolean }>;
  purchaseType?: 'one_time' | 'subscription';
  subscriptionSchedule?: 'weekly' | 'biweekly' | 'monthly';
};

function lineKey(line: {
  productId: string;
  variantId?: string;
  bundleId?: string;
  selectedBundleItemIds?: string[];
  modifierOptionIds?: string[];
  purchaseType?: 'one_time' | 'subscription';
  subscriptionSchedule?: 'weekly' | 'biweekly' | 'monthly';
}): string {
  const mods = [...(line.modifierOptionIds ?? [])].sort().join(',');
  const selectedBundleItems = [...(line.selectedBundleItemIds ?? [])].sort().join(',');
  return `${line.productId}:${line.variantId ?? ''}:${line.bundleId ?? ''}:${selectedBundleItems}:${mods}:${line.purchaseType ?? 'one_time'}:${line.subscriptionSchedule ?? ''}`;
}

function resolveUnitPrice(
  product: OnlineProduct,
  variantId?: string,
  modifierOptionIds?: string[],
): number {
  let price = Number.parseFloat(product.price) || 0;
  const variant = product.variants.find((v) => v.id === variantId);
  if (variant) price += Number.parseFloat(variant.priceDelta) || 0;
  for (const mod of product.modifiers) {
    for (const opt of mod.options) {
      if (modifierOptionIds?.includes(opt.id)) {
        price += Number.parseFloat(opt.priceDelta) || 0;
      }
    }
  }
  return price;
}

function buildLineMeta(
  product: OnlineProduct,
  quantity: number,
  options?: {
    variantId?: string;
    modifierOptionIds?: string[];
    selectedBundleItemIds?: string[];
    notes?: string;
    purchaseType?: 'one_time' | 'subscription';
    subscriptionSchedule?: 'weekly' | 'biweekly' | 'monthly';
  },
): BasketLineMeta {
  const variant = product.variants.find((v) => v.id === options?.variantId);
  const modifierLabels: string[] = [];
  for (const mod of product.modifiers) {
    for (const opt of mod.options) {
      if (options?.modifierOptionIds?.includes(opt.id)) {
        modifierLabels.push(opt.name);
      }
    }
  }
  return {
    lineId: crypto.randomUUID(),
    productId: product.id,
    variantId: options?.variantId,
    bundleId: product.bundleId,
    selectedBundleItemIds: options?.selectedBundleItemIds,
    modifierOptionIds: options?.modifierOptionIds,
    name: product.name,
    variantName: variant?.name,
    modifierLabels,
    sku: product.sku ?? variant?.sku,
    unitPrice: resolveUnitPrice(product, options?.variantId, options?.modifierOptionIds),
    quantity,
    notes: options?.notes,
    bundleItems: product.bundleItems,
    purchaseType: options?.purchaseType,
    subscriptionSchedule: options?.subscriptionSchedule,
  };
}

type BasketState = {
  lines: BasketLineMeta[];
  hydrated: boolean;
  error?: string;
  hydrate: () => void;
  addItem: (
    product: OnlineProduct,
    options?: {
      variantId?: string;
      modifierOptionIds?: string[];
      selectedBundleItemIds?: string[];
      notes?: string;
      purchaseType?: 'one_time' | 'subscription';
      subscriptionSchedule?: 'weekly' | 'biweekly' | 'monthly';
    },
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  setLineNotes: (lineId: string, notes: string) => void;
  clearBasket: () => void;
  lineCount: () => number;
};

function persist(lines: BasketLineMeta[]) {
  saveBasket(lines);
}

export const useBasketStore = create<BasketState>((set, get) => ({
  lines: [],
  hydrated: false,
  error: undefined,

  hydrate: () => {
    if (get().hydrated) return;
    set({ lines: loadBasket(), hydrated: true });
  },

  addItem: (product, options) => {
    if (!isProductOrderable(product)) {
      set({ error: 'This item is out of stock' });
      return;
    }
    const key = lineKey({
      productId: product.id,
      variantId: options?.variantId,
      bundleId: product.bundleId,
      selectedBundleItemIds: options?.selectedBundleItemIds,
      modifierOptionIds: options?.modifierOptionIds,
      purchaseType: options?.purchaseType,
      subscriptionSchedule: options?.subscriptionSchedule,
    });
    const existing = get().lines.find((l) => lineKey(l) === key);
    let next: BasketLineMeta[];
    if (existing) {
      next = get().lines.map((l) =>
        l.lineId === existing.lineId ? { ...l, quantity: l.quantity + 1 } : l,
      );
    } else {
      next = [...get().lines, buildLineMeta(product, 1, options)];
    }
    persist(next);
    set({ lines: next, error: undefined });
  },

  updateQuantity: (lineId, quantity) => {
    if (quantity < 1) {
      set({ error: 'Quantity must be at least 1' });
      return;
    }
    const next = get().lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l));
    persist(next);
    set({ lines: next, error: undefined });
  },

  removeLine: (lineId) => {
    const next = get().lines.filter((l) => l.lineId !== lineId);
    persist(next);
    set({ lines: next, error: undefined });
  },

  setLineNotes: (lineId, notes) => {
    const next = get().lines.map((l) => (l.lineId === lineId ? { ...l, notes } : l));
    persist(next);
    set({ lines: next });
  },

  clearBasket: () => {
    clearBasketStorage();
    set({ lines: [], error: undefined });
  },

  lineCount: () => get().lines.reduce((sum, line) => sum + line.quantity, 0),
}));
