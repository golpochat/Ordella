/** Polymorphic reference for movements, reservations, etc. */
export enum StockReferenceType {
  ORDER = 'order',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  WASTAGE = 'wastage',
  MANUAL = 'manual',
  PURCHASE_ORDER = 'purchase_order',
}
