import { OrderStatus } from '../enums/order-status.enum';
import { OrderEventTypes } from '../constants/order-events.constants';

const STATUS_TO_EVENT_TYPE: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: OrderEventTypes.CREATED,
  [OrderStatus.ACCEPTED]: OrderEventTypes.ACCEPTED,
  [OrderStatus.PREPARING]: OrderEventTypes.PREPARING,
  [OrderStatus.READY]: OrderEventTypes.READY,
  [OrderStatus.DISPATCHED]: OrderEventTypes.DISPATCHED,
  [OrderStatus.DELIVERED]: OrderEventTypes.DELIVERED,
  [OrderStatus.REFUNDED]: OrderEventTypes.REFUNDED,
  [OrderStatus.CANCELLED]: OrderEventTypes.CANCELLED,
  [OrderStatus.FAILED]: OrderEventTypes.FAILED,
};

export function orderStatusToEventType(status: OrderStatus): string {
  return STATUS_TO_EVENT_TYPE[status] ?? `order.${status}`;
}
