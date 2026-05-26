export function parseMoney(value: string | number): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

export type PosTotalsInput = {
  subtotal: number;
  discountPercent?: number;
  discountFixed?: number;
  taxRate?: string | number;
  priceMode?: 'inclusive' | 'exclusive';
  taxName?: string;
};

type TaxBreakdownLine = {
  taxName: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  priceMode: 'inclusive' | 'exclusive';
};

export function calculatePosTotals(input: PosTotalsInput): {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  taxBreakdown: TaxBreakdownLine[];
  total: number;
} {
  const subtotal = Math.max(0, input.subtotal);
  const percentOff =
    input.discountPercent && input.discountPercent > 0
      ? subtotal * (input.discountPercent / 100)
      : 0;
  const fixedOff = input.discountFixed && input.discountFixed > 0 ? input.discountFixed : 0;
  const discount = Math.min(subtotal, percentOff + fixedOff);
  const discounted = Math.max(0, subtotal - discount);
  const ratePercent = Number(input.taxRate ?? 23);
  const rate = Number.isFinite(ratePercent) ? Math.max(0, ratePercent) / 100 : 0;
  const priceMode = input.priceMode ?? 'inclusive';
  const taxable = priceMode === 'inclusive' && rate > 0 ? discounted / (1 + rate) : discounted;
  const tax = priceMode === 'inclusive' ? discounted - taxable : taxable * rate;
  const total = priceMode === 'inclusive' ? discounted : discounted + tax;
  return {
    subtotal,
    discount,
    taxable,
    tax,
    taxBreakdown: discounted > 0
      ? [{ taxName: input.taxName ?? 'Standard VAT', taxRate: ratePercent, taxableAmount: taxable, taxAmount: tax, priceMode }]
      : [],
    total,
  };
}
