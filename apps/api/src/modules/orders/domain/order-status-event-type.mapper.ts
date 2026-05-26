import { OrderStatus } from '../enums/order-status.enum';
import { OrderEventTypes } from '../constants/order-events.constants';

const STATUS_TO_EVENT_TYPE: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: OrderEventTypes.CREATED,
  [OrderStatus.ACCEPTED]: OrderEventTypes.ACCEPTED,
  [OrderStatus.PICKING]: OrderEventTypes.PICKING,
  [OrderStatus.PICKED]: OrderEventTypes.PICKED,
  [OrderStatus.PREPARING]: OrderEventTypes.PREPARING,
  [OrderStatus.READY]: OrderEventTypes.READY,
  [OrderStatus.HANDED_TO_DRIVER]: OrderEventTypes.HANDED_TO_DRIVER,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderEventTypes.OUT_FOR_DELIVERY,
  [OrderStatus.COMPLETED]: OrderEventTypes.COMPLETED,
  [OrderStatus.REFUNDED]: OrderEventTypes.REFUNDED,
  [OrderStatus.CANCELLED]: OrderEventTypes.CANCELLED,
  [OrderStatus.FAILED]: OrderEventTypes.FAILED,
};

export function orderStatusToEventType(status: OrderStatus): string {
  return STATUS_TO_EVENT_TYPE[status] ?? `order.${status}`;
}
