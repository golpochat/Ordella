import { WarehouseBinItemEntity } from './warehouse-bin-item.entity';
import { WarehouseBinEntity } from './warehouse-bin.entity';
import { FulfillmentSlotEntity } from './fulfillment-slot.entity';
import { PickWaveEntity } from './pick-wave.entity';
import { WarehousePickTaskEntity } from './warehouse-pick-task.entity';
import { WarehouseZoneEntity } from './warehouse-zone.entity';

export { WarehouseBinItemEntity } from './warehouse-bin-item.entity';
export { WarehouseBinEntity } from './warehouse-bin.entity';
export { FulfillmentSlotEntity } from './fulfillment-slot.entity';
export { PickWaveEntity } from './pick-wave.entity';
export type { PickWaveStatus } from './pick-wave.entity';
export { WarehousePickTaskEntity } from './warehouse-pick-task.entity';
export type { WarehousePickTaskStatus } from './warehouse-pick-task.entity';
export { WarehouseZoneEntity } from './warehouse-zone.entity';
export type { WarehouseZoneType } from './warehouse-zone.entity';

export const WAREHOUSE_ENTITIES = [
  WarehouseZoneEntity,
  PickWaveEntity,
  FulfillmentSlotEntity,
  WarehouseBinEntity,
  WarehouseBinItemEntity,
  WarehousePickTaskEntity,
];
