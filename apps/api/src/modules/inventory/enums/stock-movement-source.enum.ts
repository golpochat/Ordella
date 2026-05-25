/** InventoryMovement.source — where the movement originated */
export enum StockMovementSource {
  ORDER = 'order',
  MANUAL = 'manual',
  ADJUSTMENT = 'adjustment',
  SYSTEM = 'system',
  PURCHASE_ORDER = 'purchase_order',
}
