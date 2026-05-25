'use client';

import { create } from 'zustand';
import type { PosCatalogItem } from '@/lib/api';
import { createOrPatchCart, type PosCart } from '@/lib/api';
import {
  clearOfflineOpenCart,
  loadOfflineOpenCart,
  loadOfflineSettings,
  saveOfflineOpenCart,
} from '@/lib/offline-db';
import { getSession } from '@/lib/session';

export type CartLineMeta = {
  productId: string;
  variantId?: string;
  bundleId?: string;
  modifierOptionIds?: string[];
  name: string;
  variantName?: string;
  modifierLabels: string[];
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  stockLevel?: number | null;
  stockStatus?: string | null;
  notes?: string;
  bundleItems?: Array<{ itemId: string; name?: string; quantity: number; isOptional?: boolean }>;
};

export function cartLineKey(line: {
  productId: string;
  variantId?: string;
  bundleId?: string;
  modifierOptionIds?: string[];
}): string {
  const mods = [...(line.modifierOptionIds ?? [])].sort().join(',');
  return `${line.productId}:${line.variantId ?? ''}:${line.bundleId ?? ''}:${mods}`;
}

type CartState = {
  cartId?: string;
  lines: CartLineMeta[];
  catalogById: Record<string, PosCatalogItem>;
  syncing: boolean;
  error?: string;
  discountPercent: number;
  discountFixed: number;
  setCatalog: (items: PosCatalogItem[]) => void;
  setFromServer: (cart: PosCart) => void;
  hydrateOfflineCart: () => Promise<void>;
  addCatalogItem: (
    item: PosCatalogItem,
    options?: { variantId?: string; modifierOptionIds?: string[]; notes?: string },
  ) => Promise<void>;
  updateQuantity: (lineKey: string, quantity: number) => Promise<void>;
  removeLine: (lineKey: string) => Promise<void>;
  setLineNotes: (lineKey: string, notes: string) => Promise<void>;
  setDiscountPercent: (value: number) => void;
  setDiscountFixed: (value: number) => void;
  clearCart: () => void;
  lineCount: () => number;
  subtotal: () => number;
};

function resolveUnitPrice(item: PosCatalogItem, variantId?: string, modifierOptionIds?: string[]): number {
  let price = Number.parseFloat(item.price) || 0;
  const variant = item.variants.find((v) => v.id === variantId);
  if (variant) price += Number.parseFloat(variant.priceDelta) || 0;
  for (const mod of item.modifiers) {
    for (const opt of mod.options) {
      if (modifierOptionIds?.includes(opt.id)) {
        price += Number.parseFloat(opt.priceDelta) || 0;
      }
    }
  }
  return price;
}

function buildLineMeta(
  item: PosCatalogItem,
  quantity: number,
  options?: { variantId?: string; modifierOptionIds?: string[]; notes?: string },
): CartLineMeta {
  const variant = item.variants.find((v) => v.id === options?.variantId);
  const modifierLabels: string[] = [];
  for (const mod of item.modifiers) {
    for (const opt of mod.options) {
      if (options?.modifierOptionIds?.includes(opt.id)) {
        modifierLabels.push(opt.name);
      }
    }
  }
  return {
    productId: item.id,
    variantId: options?.variantId,
    bundleId: item.bundleId,
    modifierOptionIds: options?.modifierOptionIds,
    name: item.name,
    variantName: variant?.name,
    modifierLabels,
    sku: item.sku ?? variant?.sku,
    unitPrice: resolveUnitPrice(item, options?.variantId, options?.modifierOptionIds),
    quantity,
    stockLevel: item.stockLevel ?? null,
    stockStatus: item.stockStatus ?? null,
    notes: options?.notes,
    bundleItems: item.bundleItems,
  };
}

function mergeServerCart(
  cart: PosCart,
  catalogById: Record<string, PosCatalogItem>,
  existing: CartLineMeta[],
): CartLineMeta[] {
  return cart.items.map((serverLine) => {
    const key = cartLineKey(serverLine);
    const prev = existing.find((l) => cartLineKey(l) === key);
    const item = catalogById[serverLine.productId];
    if (!item) {
      return (
        prev ?? {
          productId: serverLine.productId,
          variantId: serverLine.variantId,
          bundleId: serverLine.bundleId,
          modifierOptionIds: serverLine.modifierOptionIds,
          name: serverLine.productId,
          modifierLabels: [],
          unitPrice: 0,
          quantity: serverLine.quantity,
          notes: serverLine.notes,
        }
      );
    }
    const meta = buildLineMeta(item, serverLine.quantity, {
      variantId: serverLine.variantId,
      modifierOptionIds: serverLine.modifierOptionIds,
      notes: serverLine.notes ?? prev?.notes,
    });
    return { ...meta, notes: serverLine.notes ?? prev?.notes };
  });
}

function isLocalCartId(cartId?: string): boolean {
  return Boolean(cartId?.startsWith('local-'));
}

function browserIsOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

function createLocalCartId(): string {
  return `local-${crypto.randomUUID()}`;
}

async function persistLocalCart(state: Pick<CartState, 'cartId' | 'lines' | 'discountPercent' | 'discountFixed'>): Promise<void> {
  if (!state.cartId || !isLocalCartId(state.cartId)) return;
  if (!state.lines.length) {
    await clearOfflineOpenCart();
    return;
  }
  await saveOfflineOpenCart({
    id: state.cartId,
    session: getSession(),
    lines: state.lines,
    discountPercent: state.discountPercent,
    discountFixed: state.discountFixed,
    updatedAt: new Date().toISOString(),
  });
}

async function canSellTrackedStock(item: PosCatalogItem, existingQty: number): Promise<string | null> {
  if (!item.inventoryTrackingEnabled) return null;
  const settings = await loadOfflineSettings();
  const stockLevel = item.stockLevel;

  if (stockLevel === null || stockLevel === undefined) {
    return settings.allowUnknownStockOfflineSales ? null : `${item.name} stock is unavailable offline`;
  }

  if (stockLevel <= 0 && !settings.allowOutOfStockOfflineSales) {
    return `${item.name} is out of stock`;
  }

  if (!settings.allowOutOfStockOfflineSales && existingQty + 1 > stockLevel) {
    return `Only ${stockLevel} available at this location`;
  }

  return null;
}

function mergeLocalLine(lines: CartLineMeta[], line: CartLineMeta): CartLineMeta[] {
  const key = cartLineKey(line);
  const existing = lines.find((entry) => cartLineKey(entry) === key);
  if (!existing) return [...lines, line];
  return lines.map((entry) =>
    cartLineKey(entry) === key ? { ...entry, quantity: entry.quantity + line.quantity } : entry,
  );
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: undefined,
  lines: [],
  catalogById: {},
  syncing: false,
  error: undefined,
  discountPercent: 0,
  discountFixed: 0,

  setCatalog: (items) => {
    const catalogById: Record<string, PosCatalogItem> = {};
    for (const item of items) catalogById[item.id] = item;
    set({ catalogById });
  },

  setFromServer: (cart) => {
    const existing = get().lines;
    set({
      cartId: cart.cartId,
      lines: mergeServerCart(cart, get().catalogById, existing),
    });
    void clearOfflineOpenCart();
  },

  hydrateOfflineCart: async () => {
    const cart = await loadOfflineOpenCart();
    if (!cart?.lines.length) return;
    set({
      cartId: cart.id,
      lines: cart.lines,
      discountPercent: cart.discountPercent,
      discountFixed: cart.discountFixed,
    });
  },

  addCatalogItem: async (item, options) => {
    if (!item.isActive) {
      set({ error: 'Inactive item cannot be ordered' });
      return;
    }
    const key = cartLineKey({
      productId: item.id,
      variantId: options?.variantId,
      bundleId: item.bundleId,
      modifierOptionIds: options?.modifierOptionIds,
    });
    const existingQty = get().lines.find((line) => cartLineKey(line) === key)?.quantity ?? 0;
    const stockError = await canSellTrackedStock(item, existingQty);
    if (stockError) {
      set({ error: stockError });
      return;
    }

    set({ syncing: true, error: undefined });
    const line = {
      productId: item.id,
      bundleId: item.bundleId,
      quantity: 1,
      variantId: options?.variantId,
      modifierOptionIds: options?.modifierOptionIds,
      notes: options?.notes,
    };

    const addLocal = async () => {
      const current = get();
      const meta = buildLineMeta(item, 1, options);
      const nextCartId = isLocalCartId(current.cartId) ? current.cartId : createLocalCartId();
      const nextLines = mergeLocalLine(current.lines, meta);
      set({ cartId: nextCartId, lines: nextLines, error: undefined });
      await persistLocalCart({ ...get(), cartId: nextCartId, lines: nextLines });
    };

    try {
      const current = get();
      if (!browserIsOnline() || isLocalCartId(current.cartId)) {
        await addLocal();
        return;
      }
      const cart = await createOrPatchCart(
        current.cartId
          ? { cartId: current.cartId, action: 'add', item: line }
          : { item: line },
      );
      get().setFromServer(cart);
    } catch (error) {
      if (!browserIsOnline()) {
        await addLocal();
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to add item' });
      }
    } finally {
      set({ syncing: false });
    }
  },

  updateQuantity: async (lineKey, quantity) => {
    if (quantity < 1) {
      set({ error: 'Quantity must be at least 1' });
      return;
    }
    const line = get().lines.find((l) => cartLineKey(l) === lineKey);
    const cartId = get().cartId;
    if (!line || !cartId) return;
    const settings = await loadOfflineSettings();
    if (!settings.allowOutOfStockOfflineSales && line.stockLevel !== null && line.stockLevel !== undefined && quantity > line.stockLevel) {
      set({ error: `Only ${line.stockLevel} available at this location` });
      return;
    }

    set({ syncing: true, error: undefined });
    try {
      if (!browserIsOnline() || isLocalCartId(cartId)) {
        const lines = get().lines.map((l) => (cartLineKey(l) === lineKey ? { ...l, quantity } : l));
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: nextCartId, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
        return;
      }
      const cart = await createOrPatchCart({
        cartId,
        action: 'update',
        item: {
          productId: line.productId,
          variantId: line.variantId,
          bundleId: line.bundleId,
          quantity,
          modifierOptionIds: line.modifierOptionIds,
        },
      });
      get().setFromServer(cart);
    } catch (error) {
      if (!browserIsOnline()) {
        const lines = get().lines.map((l) => (cartLineKey(l) === lineKey ? { ...l, quantity } : l));
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: nextCartId, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
      }
    } finally {
      set({ syncing: false });
    }
  },

  removeLine: async (lineKey) => {
    const line = get().lines.find((l) => cartLineKey(l) === lineKey);
    const cartId = get().cartId;
    if (!line || !cartId) return;

    set({ syncing: true, error: undefined });
    try {
      if (!browserIsOnline() || isLocalCartId(cartId)) {
        const lines = get().lines.filter((l) => cartLineKey(l) !== lineKey);
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: lines.length ? nextCartId : undefined, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
        return;
      }
      const cart = await createOrPatchCart({
        cartId,
        action: 'remove',
        item: {
          productId: line.productId,
          variantId: line.variantId,
          bundleId: line.bundleId,
          quantity: 1,
        },
      });
      get().setFromServer(cart);
    } catch (error) {
      if (!browserIsOnline()) {
        const lines = get().lines.filter((l) => cartLineKey(l) !== lineKey);
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: lines.length ? nextCartId : undefined, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
      }
    } finally {
      set({ syncing: false });
    }
  },

  setLineNotes: async (lineKey, notes) => {
    const line = get().lines.find((l) => cartLineKey(l) === lineKey);
    const cartId = get().cartId;
    if (!line || !cartId) return;

    set({ syncing: true, error: undefined });
    try {
      if (!browserIsOnline() || isLocalCartId(cartId)) {
        const lines = get().lines.map((l) =>
          cartLineKey(l) === lineKey ? { ...l, notes } : l,
        );
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: nextCartId, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
        return;
      }
      const cart = await createOrPatchCart({
        cartId,
        action: 'update',
        item: {
          productId: line.productId,
          variantId: line.variantId,
          bundleId: line.bundleId,
          quantity: line.quantity,
          modifierOptionIds: line.modifierOptionIds,
          notes,
        },
      });
      get().setFromServer(cart);
      set((state) => ({
        lines: state.lines.map((l) =>
          cartLineKey(l) === lineKey ? { ...l, notes } : l,
        ),
      }));
    } catch (error) {
      if (!browserIsOnline()) {
        const lines = get().lines.map((l) =>
          cartLineKey(l) === lineKey ? { ...l, notes } : l,
        );
        const nextCartId = isLocalCartId(cartId) ? cartId : createLocalCartId();
        set({ cartId: nextCartId, lines });
        await persistLocalCart({ ...get(), cartId: nextCartId, lines });
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to update notes' });
      }
    } finally {
      set({ syncing: false });
    }
  },

  setDiscountPercent: (value) => {
    set({ discountPercent: Math.max(0, Math.min(100, value)) });
    void persistLocalCart(get());
  },
  setDiscountFixed: (value) => {
    set({ discountFixed: Math.max(0, value) });
    void persistLocalCart(get());
  },

  clearCart: () => {
    set({
      cartId: undefined,
      lines: [],
      error: undefined,
      discountPercent: 0,
      discountFixed: 0,
    });
    void clearOfflineOpenCart();
  },

  lineCount: () => get().lines.reduce((sum, line) => sum + line.quantity, 0),

  subtotal: () =>
    get().lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
}));
