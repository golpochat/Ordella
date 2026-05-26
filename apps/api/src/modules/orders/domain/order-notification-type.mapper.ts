import { OrderStatus } from '../enums/order-status.enum';
import { OrderNotificationType } from '../enums/order-notification-type.enum';

const STATUS_TO_NOTIFICATION: Partial<Record<OrderStatus, OrderNotificationType>> = {
  [OrderStatus.PENDING]: OrderNotificationType.ORDER_CREATED,
  [OrderStatus.ACCEPTED]: OrderNotificationType.ORDER_CONFIRMED,
  [OrderStatus.PICKING]: OrderNotificationType.ORDER_PREPARING,
  [OrderStatus.PICKED]: OrderNotificationType.ORDER_PREPARING,
  [OrderStatus.PREPARING]: OrderNotificationType.ORDER_PREPARING,
  [OrderStatus.READY]: OrderNotificationType.ORDER_READY,
  [OrderStatus.HANDED_TO_DRIVER]: OrderNotificationType.ORDER_OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderNotificationType.ORDER_OUT_FOR_DELIVERY,
  [OrderStatus.COMPLETED]: OrderNotificationType.ORDER_COMPLETED,
  [OrderStatus.CANCELLED]: OrderNotificationType.ORDER_CANCELLED,
  [OrderStatus.REFUNDED]: OrderNotificationType.ORDER_REFUNDED,
};

export function orderStatusToNotificationType(
  status: OrderStatus,
): OrderNotificationType | null {
  return STATUS_TO_NOTIFICATION[status] ?? null;
}
