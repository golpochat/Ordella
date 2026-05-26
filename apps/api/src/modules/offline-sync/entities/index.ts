import { EdgeDeviceEntity } from './edge-device.entity';
import { OfflineLocationSettingEntity } from './offline-location-setting.entity';
import { OfflineSyncConflictEntity } from './offline-sync-conflict.entity';
import { OfflineSyncCursorEntity } from './offline-sync-cursor.entity';
import { OfflineSyncLogEntity } from './offline-sync-log.entity';
import { OfflineSyncOperationEntity } from './offline-sync-operation.entity';

export { EdgeDeviceEntity } from './edge-device.entity';
export type { EdgeDeviceStatus, EdgeDeviceType } from './edge-device.entity';
export { OfflineLocationSettingEntity } from './offline-location-setting.entity';
export { OfflineSyncConflictEntity } from './offline-sync-conflict.entity';
export { OfflineSyncCursorEntity } from './offline-sync-cursor.entity';
export { OfflineSyncLogEntity } from './offline-sync-log.entity';
export { OfflineSyncOperationEntity } from './offline-sync-operation.entity';
export type { OfflineConflictStrategy, OfflineSyncStatus } from './offline-sync-operation.entity';

export const OFFLINE_SYNC_ENTITIES = [
  EdgeDeviceEntity,
  OfflineLocationSettingEntity,
  OfflineSyncConflictEntity,
  OfflineSyncCursorEntity,
  OfflineSyncLogEntity,
  OfflineSyncOperationEntity,
];
