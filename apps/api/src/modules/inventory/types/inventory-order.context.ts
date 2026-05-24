/** Line quantity for order-driven stock operations (no Orders module import). */
export interface InventoryOrderLine {
  productId: string;
  quantity: number;
}

/** Context for reserve / deduct / release / refund from an order lifecycle step. */
export interface InventoryOrderContext {
  tenantId: string;
  orderId: string;
  locationId: string;
  lines: InventoryOrderLine[];
}
