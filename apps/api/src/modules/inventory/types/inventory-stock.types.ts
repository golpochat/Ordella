/** Domain view of stock for a product at a location (maps to stock_items). */
export interface InventoryStockView {
  stockItemId: string;
  productId: string;
  sku: string;
  quantityOnHand: string;
  quantityReserved: string;
  available: string;
}

export interface InventoryReserveResult {
  reservationIds: string[];
}

export interface InventoryDeductResult {
  movementIds: string[];
}

export interface RecordMovementInput {
  tenantId: string;
  stockItemId: string;
  type: import('../enums/stock-movement-type.enum').StockMovementType;
  delta: number;
  source: import('../enums/stock-movement-source.enum').StockMovementSource;
  orderId?: string | null;
  notes?: string | null;
}
