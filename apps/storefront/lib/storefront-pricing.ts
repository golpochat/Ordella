import type { BasketLineMeta } from '@/stores/basket-store';

export const STOREFRONT_TAX_RATE = 0.1;

export function lineTotal(line: BasketLineMeta): number {
  return line.unitPrice * line.quantity;
}

export function basketSubtotal(lines: BasketLineMeta[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function calculateStorefrontTotals(subtotal: number): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const tax = subtotal * STOREFRONT_TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}
