import { OrderStatus } from '../enums/order-status.enum';
import { OrderReportingEventType } from '../enums/order-reporting-event-type.enum';

const STATUS_TO_REPORTING: Partial<Record<OrderStatus, OrderReportingEventType>> = {
  [OrderStatus.PENDING]: OrderReportingEventType.ORDER_CREATED,
  [OrderStatus.ACCEPTED]: OrderReportingEventType.ORDER_CONFIRMED,
  [OrderStatus.PREPARING]: OrderReportingEventType.ORDER_PREPARING,
  [OrderStatus.READY]: OrderReportingEventType.ORDER_READY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderReportingEventType.ORDER_OUT_FOR_DELIVERY,
  [OrderStatus.COMPLETED]: OrderReportingEventType.ORDER_COMPLETED,
  [OrderStatus.CANCELLED]: OrderReportingEventType.ORDER_CANCELLED,
  [OrderStatus.REFUNDED]: OrderReportingEventType.ORDER_REFUNDED,
};

export function orderStatusToReportingEventType(
  status: OrderStatus,
): OrderReportingEventType | null {
  return STATUS_TO_REPORTING[status] ?? null;
}
