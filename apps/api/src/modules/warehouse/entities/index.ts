import { WarehouseBinItemEntity } from './warehouse-bin-item.entity';
import { WarehouseBinEntity } from './warehouse-bin.entity';
import { WarehousePickTaskEntity } from './warehouse-pick-task.entity';
import { WarehouseZoneEntity } from './warehouse-zone.entity';

export { WarehouseBinItemEntity } from './warehouse-bin-item.entity';
export { WarehouseBinEntity } from './warehouse-bin.entity';
export { WarehousePickTaskEntity } from './warehouse-pick-task.entity';
export type { WarehousePickTaskStatus } from './warehouse-pick-task.entity';
export { WarehouseZoneEntity } from './warehouse-zone.entity';
export type { WarehouseZoneType } from './warehouse-zone.entity';

export const WAREHOUSE_ENTITIES = [
  WarehouseZoneEntity,
  WarehouseBinEntity,
  WarehouseBinItemEntity,
  WarehousePickTaskEntity,
];
