export const InventoryEvents = {
  STOCK_ITEM_CREATED: 'inventory.stock_item.created',
  STOCK_MOVEMENT_RECORDED: 'inventory.stock_movement.recorded',
  STOCK_ADJUSTMENT_CREATED: 'inventory.stock_adjustment.created',
  STOCK_TRANSFER_CREATED: 'inventory.stock_transfer.created',
  STOCK_TRANSFER_COMPLETED: 'inventory.stock_transfer.completed',
  STOCK_RESERVATION_CREATED: 'inventory.stock_reservation.created',
  STOCK_RESERVATION_RELEASED: 'inventory.stock_reservation.released',
  WASTAGE_RECORDED: 'inventory.wastage.recorded',
  STOCK_LOW: 'inventory.stock.low',
} as const;
