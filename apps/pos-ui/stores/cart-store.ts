'use client';

import { create } from 'zustand';
import type { PosCatalogItem } from '@/lib/api';
import { createOrPatchCart, type PosCart } from '@/lib/api';

export type CartLineMeta = {
  productId: string;
  variantId?: string;
  modifierOptionIds?: string[];
  name: string;
  variantName?: string;
  modifierLabels: string[];
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  notes?: string;
};

export function cartLineKey(line: {
  productId: string;
  variantId?: string;
  modifierOptionIds?: string[];
}): string {
  const mods = [...(line.modifierOptionIds ?? [])].sort().join(',');
  return `${line.productId}:${line.variantId ?? ''}:${mods}`;
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
    modifierOptionIds: options?.modifierOptionIds,
    name: item.name,
    variantName: variant?.name,
    modifierLabels,
    sku: item.sku ?? variant?.sku,
    unitPrice: resolveUnitPrice(item, options?.variantId, options?.modifierOptionIds),
    quantity,
    notes: options?.notes,
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
  },

  addCatalogItem: async (item, options) => {
    if (!item.isActive) {
      set({ error: 'Inactive item cannot be ordered' });
      return;
    }
    if (item.inventoryTrackingEnabled && item.stockLevel !== null && item.stockLevel !== undefined) {
      if (item.stockLevel < 1) {
        set({ error: `${item.name} is out of stock` });
        return;
      }
    }

    set({ syncing: true, error: undefined });
    try {
      const current = get();
      const line = {
        productId: item.id,
        quantity: 1,
        variantId: options?.variantId,
        modifierOptionIds: options?.modifierOptionIds,
        notes: options?.notes,
      };
      const cart = await createOrPatchCart(
        current.cartId
          ? { cartId: current.cartId, action: 'add', item: line }
          : { item: line },
      );
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add item' });
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

    set({ syncing: true, error: undefined });
    try {
      const cart = await createOrPatchCart({
        cartId,
        action: 'update',
        item: {
          productId: line.productId,
          variantId: line.variantId,
          quantity,
          modifierOptionIds: line.modifierOptionIds,
        },
      });
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
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
      const cart = await createOrPatchCart({
        cartId,
        action: 'remove',
        item: {
          productId: line.productId,
          variantId: line.variantId,
          quantity: 1,
        },
      });
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
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
      const cart = await createOrPatchCart({
        cartId,
        action: 'update',
        item: {
          productId: line.productId,
          variantId: line.variantId,
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
      set({ error: error instanceof Error ? error.message : 'Failed to update notes' });
    } finally {
      set({ syncing: false });
    }
  },

  setDiscountPercent: (value) => set({ discountPercent: Math.max(0, Math.min(100, value)) }),
  setDiscountFixed: (value) => set({ discountFixed: Math.max(0, value) }),

  clearCart: () => {
    set({
      cartId: undefined,
      lines: [],
      error: undefined,
      discountPercent: 0,
      discountFixed: 0,
    });
  },

  lineCount: () => get().lines.reduce((sum, line) => sum + line.quantity, 0),

  subtotal: () =>
    get().lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
}));
