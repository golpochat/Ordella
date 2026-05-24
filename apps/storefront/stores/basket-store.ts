'use client';

import { create } from 'zustand';
import {
  createOrPatchBasket,
  isProductOrderable,
  type OnlineBasket,
  type OnlineProduct,
} from '@/lib/api';

export type BasketLine = {
  id: string;
  productId: string;
  quantity: number;
  modifierOptionIds?: string[];
};

type BasketState = {
  sessionId?: string;
  items: BasketLine[];
  syncing: boolean;
  error?: string;
  setFromServer: (basket: OnlineBasket) => void;
  addItem: (product: OnlineProduct, modifierOptionIds?: string[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearBasket: () => void;
  lineCount: () => number;
};

export const useBasketStore = create<BasketState>((set, get) => ({
  sessionId: undefined,
  items: [],
  syncing: false,
  error: undefined,

  setFromServer: (basket) => {
    set({
      sessionId: basket.sessionId,
      items: basket.items.map((line) => ({
        id: line.id,
        productId: line.productId,
        quantity: line.quantity,
        modifierOptionIds: line.modifierOptionIds,
      })),
    });
  },

  addItem: async (product, modifierOptionIds) => {
    if (!isProductOrderable(product)) {
      set({ error: 'This item is out of stock' });
      return;
    }

    set({ syncing: true, error: undefined });
    try {
      const current = get();
      const basket = await createOrPatchBasket(
        current.sessionId
          ? {
              sessionId: current.sessionId,
              action: 'add',
              item: { productId: product.id, quantity: 1, modifierOptionIds },
            }
          : {
              item: { productId: product.id, quantity: 1, modifierOptionIds },
            },
      );
      get().setFromServer(basket);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add item' });
    } finally {
      set({ syncing: false });
    }
  },

  updateQuantity: async (lineId, quantity) => {
    if (quantity < 1) {
      set({ error: 'Quantity must be at least 1' });
      return;
    }
    const sessionId = get().sessionId;
    if (!sessionId) return;

    set({ syncing: true, error: undefined });
    try {
      const basket = await createOrPatchBasket({
        sessionId,
        action: 'update',
        item: { itemId: lineId, quantity },
      });
      get().setFromServer(basket);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
    } finally {
      set({ syncing: false });
    }
  },

  removeItem: async (lineId) => {
    const sessionId = get().sessionId;
    if (!sessionId) return;

    set({ syncing: true, error: undefined });
    try {
      const basket = await createOrPatchBasket({
        sessionId,
        action: 'remove',
        item: { itemId: lineId, quantity: 1 },
      });
      get().setFromServer(basket);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
    } finally {
      set({ syncing: false });
    }
  },

  clearBasket: () => {
    set({ sessionId: undefined, items: [], error: undefined });
  },

  lineCount: () => get().items.reduce((sum, line) => sum + line.quantity, 0),
}));
