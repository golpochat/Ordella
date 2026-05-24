import { DeliveryAssignmentEntity } from './delivery-assignment.entity';
import { DeliveryStatusHistoryEntity } from './delivery-status-history.entity';
import { DeliveryTaskEntity } from './delivery-task.entity';
import { DriverProfileEntity } from './driver-profile.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { DeliveryAssignmentEntity } from './delivery-assignment.entity';
export { DeliveryStatusHistoryEntity } from './delivery-status-history.entity';
export { DeliveryTaskEntity } from './delivery-task.entity';
export { DriverProfileEntity } from './driver-profile.entity';

export const DELIVERIES_ENTITIES = [
  DeliveryAssignmentEntity,
  DeliveryStatusHistoryEntity,
  DeliveryTaskEntity,
  DriverProfileEntity,
];
