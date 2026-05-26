import type { BasketLineMeta } from '@/stores/basket-store';

export function lineTotal(line: BasketLineMeta): number {
  return line.unitPrice * line.quantity;
}

export function basketSubtotal(lines: BasketLineMeta[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function calculateStorefrontTotals(
  subtotal: number,
  options: { taxRate?: string | number; priceMode?: 'inclusive' | 'exclusive'; taxName?: string } = {},
): {
  subtotal: number;
  tax: number;
  taxBreakdown: Array<{ taxName: string; taxRate: number; taxableAmount: number; taxAmount: number; priceMode: 'inclusive' | 'exclusive' }>;
  total: number;
} {
  const ratePercent = Number(options.taxRate ?? 23);
  const rate = Number.isFinite(ratePercent) ? Math.max(0, ratePercent) / 100 : 0;
  const priceMode = options.priceMode ?? 'inclusive';
  const taxableAmount = priceMode === 'inclusive' && rate > 0 ? subtotal / (1 + rate) : subtotal;
  const tax = priceMode === 'inclusive' ? subtotal - taxableAmount : taxableAmount * rate;
  return {
    subtotal,
    tax,
    taxBreakdown: subtotal > 0
      ? [{ taxName: options.taxName ?? 'Standard VAT', taxRate: ratePercent, taxableAmount, taxAmount: tax, priceMode }]
      : [],
    total: priceMode === 'inclusive' ? subtotal : subtotal + tax,
  };
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}
