import { parseQty } from './stock-quantity.util';

export type StockHealthStatus = 'ok' | 'low' | 'out';

export function computeStockHealth(
  quantityOnHand: string,
  quantityReserved: string,
  reorderLevel: string | null,
  isActive: boolean,
): StockHealthStatus {
  if (!isActive) {
    return 'out';
  }

  const available = parseQty(quantityOnHand) - parseQty(quantityReserved);
  if (available <= 0) {
    return 'out';
  }

  const reorder = reorderLevel !== null ? parseQty(reorderLevel) : null;
  if (reorder !== null && available <= reorder) {
    return 'low';
  }

  return 'ok';
}

export function stockLevelInt(quantityOnHand: string, quantityReserved: string): number {
  const available = parseQty(quantityOnHand) - parseQty(quantityReserved);
  return Math.max(0, Math.floor(available));
}
