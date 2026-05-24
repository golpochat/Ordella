import { OrderEventEntity } from './order-event.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';
import { OrderEntity } from './order.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { OrderEventEntity } from './order-event.entity';
export { OrderItemEntity } from './order-item.entity';
export { OrderStatusHistoryEntity } from './order-status-history.entity';
export { OrderEntity } from './order.entity';

export const ORDERS_ENTITIES = [
  OrderEventEntity,
  OrderItemEntity,
  OrderStatusHistoryEntity,
  OrderEntity,
];
