import type { BasketLineMeta } from '@/stores/basket-store';

const BASKET_KEY = 'ordella.storefront.basket';

export type PersistedBasket = {
  lines: BasketLineMeta[];
  updatedAt: string;
};

export function saveBasket(lines: BasketLineMeta[]): void {
  if (typeof window === 'undefined') return;
  const payload: PersistedBasket = { lines, updatedAt: new Date().toISOString() };
  localStorage.setItem(BASKET_KEY, JSON.stringify(payload));
}

export function loadBasket(): BasketLineMeta[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BASKET_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PersistedBasket;
    return parsed.lines ?? [];
  } catch {
    return [];
  }
}

export function clearBasketStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BASKET_KEY);
}
