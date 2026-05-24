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

export function addAmount(current: string, delta: number): string {
  return formatAmount(parseAmount(current) + delta);
}

export function subtractAmount(current: string, delta: number): string {
  return formatAmount(parseAmount(current) - delta);
}
