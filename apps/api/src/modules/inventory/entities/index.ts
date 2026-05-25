import { InventorySnapshotEntity } from './inventory-snapshot.entity';
import { InventorySyncLogEntity } from './inventory-sync-log.entity';
import { StockAdjustmentEntity } from './stock-adjustment.entity';
import { StockItemEntity } from './stock-item.entity';
import { StockMovementEntity } from './stock-movement.entity';
import { StockReservationEntity } from './stock-reservation.entity';
import { StockTransferLineEntity } from './stock-transfer-line.entity';
import { StockTransferEntity } from './stock-transfer.entity';
import { WastageRecordEntity } from './wastage-record.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { InventorySnapshotEntity } from './inventory-snapshot.entity';
export { InventorySyncLogEntity } from './inventory-sync-log.entity';
export type { InventorySyncReason } from './inventory-sync-log.entity';
export { StockAdjustmentEntity } from './stock-adjustment.entity';
export { StockItemEntity } from './stock-item.entity';
export { StockMovementEntity } from './stock-movement.entity';
export { StockReservationEntity } from './stock-reservation.entity';
export { StockTransferLineEntity } from './stock-transfer-line.entity';
export { StockTransferEntity } from './stock-transfer.entity';
export { WastageRecordEntity } from './wastage-record.entity';

export const INVENTORY_ENTITIES = [
  InventorySnapshotEntity,
  InventorySyncLogEntity,
  StockAdjustmentEntity,
  StockItemEntity,
  StockMovementEntity,
  StockReservationEntity,
  StockTransferLineEntity,
  StockTransferEntity,
  WastageRecordEntity,
];
