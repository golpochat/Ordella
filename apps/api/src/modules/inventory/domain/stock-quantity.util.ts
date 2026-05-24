export function parseQty(value: string | number): number {
  const amount = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return amount;
}

export function formatQty(amount: number): string {
  return amount.toFixed(4);
}

export function addQty(current: string, delta: number): string {
  return formatQty(parseQty(current) + delta);
}

export function subtractQty(current: string, delta: number): string {
  return formatQty(parseQty(current) - delta);
}

export function availableQty(quantityOnHand: string, quantityReserved: string): number {
  return parseQty(quantityOnHand) - parseQty(quantityReserved);
}

export function assertPositiveQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }
}
