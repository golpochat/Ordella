/**
 * Domain naming aliases (persisted table names unchanged).
 * - InventoryItem → stock_items
 * - InventoryAdjustment → stock_adjustments
 * - InventoryMovement → stock_movements
 */
export { StockItemEntity as InventoryItemEntity } from '../entities/stock-item.entity';
export { StockAdjustmentEntity as InventoryAdjustmentEntity } from '../entities/stock-adjustment.entity';
export { StockMovementEntity as InventoryMovementEntity } from '../entities/stock-movement.entity';
