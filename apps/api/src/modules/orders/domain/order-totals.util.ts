export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

export function parseMoney(value: string): number {
  return Number(value);
}

export function sumMoney(values: string[]): number {
  return values.reduce((sum, value) => sum + parseMoney(value), 0);
}

export interface GrandTotalComponents {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceChargeTotal: number;
  deliveryFee: number;
}

export function calculateGrandTotalAmount(components: GrandTotalComponents): number {
  const { subtotal, discountTotal, taxTotal, serviceChargeTotal, deliveryFee } = components;
  return Math.max(0, subtotal - discountTotal + taxTotal + serviceChargeTotal + deliveryFee);
}

export function calculateGrandTotal(components: GrandTotalComponents): string {
  return formatMoney(calculateGrandTotalAmount(components));
}
