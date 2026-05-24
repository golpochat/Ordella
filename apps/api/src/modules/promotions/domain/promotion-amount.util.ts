export function parseAmount(value: string | number): number {
  const amount = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return amount;
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function calculateGrandTotal(parts: {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceChargeTotal: number;
  deliveryFee: number;
}): string {
  const total =
    parts.subtotal -
    parts.discountTotal +
    parts.taxTotal +
    parts.serviceChargeTotal +
    parts.deliveryFee;
  return formatAmount(Math.max(0, total));
}
