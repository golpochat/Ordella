/** Flat tax rate for POS MVP (10%) */
export const POS_TAX_RATE = 0.1;

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
};

export function calculatePosTotals(input: PosTotalsInput): {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
} {
  const subtotal = Math.max(0, input.subtotal);
  const percentOff =
    input.discountPercent && input.discountPercent > 0
      ? subtotal * (input.discountPercent / 100)
      : 0;
  const fixedOff = input.discountFixed && input.discountFixed > 0 ? input.discountFixed : 0;
  const discount = Math.min(subtotal, percentOff + fixedOff);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * POS_TAX_RATE;
  const total = taxable + tax;
  return { subtotal, discount, taxable, tax, total };
}
