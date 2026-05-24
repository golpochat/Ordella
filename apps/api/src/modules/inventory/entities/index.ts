import { StockAdjustmentEntity } from './stock-adjustment.entity';
import { StockItemEntity } from './stock-item.entity';
import { StockMovementEntity } from './stock-movement.entity';
import { StockReservationEntity } from './stock-reservation.entity';
import { StockTransferLineEntity } from './stock-transfer-line.entity';
import { StockTransferEntity } from './stock-transfer.entity';
import { WastageRecordEntity } from './wastage-record.entity';

export { StockAdjustmentEntity } from './stock-adjustment.entity';
export { StockItemEntity } from './stock-item.entity';
export { StockMovementEntity } from './stock-movement.entity';
export { StockReservationEntity } from './stock-reservation.entity';
export { StockTransferEntity } from './stock-transfer.entity';
export { StockTransferLineEntity } from './stock-transfer-line.entity';
export { WastageRecordEntity } from './wastage-record.entity';

export const INVENTORY_ENTITIES = [
  StockItemEntity,
  StockMovementEntity,
  StockAdjustmentEntity,
  StockTransferEntity,
  StockTransferLineEntity,
  StockReservationEntity,
  WastageRecordEntity,
];
