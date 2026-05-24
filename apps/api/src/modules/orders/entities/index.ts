import { OrderEntity } from './order.entity';
import { OrderEventEntity } from './order-event.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatusHistoryEntity } from './order-status-history.entity';

export { OrderEntity } from './order.entity';
export { OrderEventEntity } from './order-event.entity';
export { OrderItemEntity } from './order-item.entity';
export { OrderStatusHistoryEntity } from './order-status-history.entity';

export const ORDERS_ENTITIES = [
  OrderEntity,
  OrderItemEntity,
  OrderStatusHistoryEntity,
  OrderEventEntity,
];
