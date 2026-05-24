import type { CheckoutResult } from './api';

const CHECKOUT_KEY = 'ordella.storefront.checkout';

export function saveCheckoutPreview(result: CheckoutResult): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(result));
}

export function loadCheckoutPreview(): CheckoutResult | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CHECKOUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutResult;
  } catch {
    return null;
  }
}

export function clearCheckoutPreview(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_KEY);
}
