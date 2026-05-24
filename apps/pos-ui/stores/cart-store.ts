'use client';

import { create } from 'zustand';
import type { Product } from '@shared-utils';
import { createOrPatchCart, type PosCart } from '@/lib/api';

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  modifierOptionIds?: string[];
};

type CartState = {
  cartId?: string;
  items: CartItem[];
  syncing: boolean;
  error?: string;
  setFromServer: (cart: PosCart) => void;
  addItem: (
    product: Product,
    options?: { variantId?: string; modifierOptionIds?: string[] },
  ) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
  lineCount: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  cartId: undefined,
  items: [],
  syncing: false,
  error: undefined,

  setFromServer: (cart) => {
    set({
      cartId: cart.cartId,
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        modifierOptionIds: i.modifierOptionIds,
      })),
    });
  },

  addItem: async (product, options) => {
    if (product.status !== 'active') {
      set({ error: 'Inactive item cannot be ordered' });
      return;
    }

    set({ syncing: true, error: undefined });
    try {
      const current = get();
      const line = {
        productId: product.id,
        quantity: 1,
        variantId: options?.variantId,
        modifierOptionIds: options?.modifierOptionIds,
      };
      const cart = await createOrPatchCart(
        current.cartId
          ? {
              cartId: current.cartId,
              action: 'add',
              item: line,
            }
          : {
              item: line,
            },
      );
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add item' });
    } finally {
      set({ syncing: false });
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) {
      set({ error: 'Quantity must be at least 1' });
      return;
    }
    const cartId = get().cartId;
    if (!cartId) return;

    set({ syncing: true, error: undefined });
    try {
      const cart = await createOrPatchCart({
        cartId,
        action: 'update',
        item: { productId, quantity },
      });
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
    } finally {
      set({ syncing: false });
    }
  },

  removeItem: async (productId) => {
    const cartId = get().cartId;
    if (!cartId) return;
    set({ syncing: true, error: undefined });
    try {
      const cart = await createOrPatchCart({
        cartId,
        action: 'remove',
        item: { productId, quantity: 1 },
      });
      get().setFromServer(cart);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
    } finally {
      set({ syncing: false });
    }
  },

  clearCart: () => {
    set({ cartId: undefined, items: [], error: undefined });
  },

  lineCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
