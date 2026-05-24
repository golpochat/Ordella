import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';

export function buildOrderReportingPayload(
  order: OrderEntity,
  items: OrderItemEntity[],
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
): Record<string, unknown> {
  return {
    orderId: order.id,
    tenantId: order.tenantId,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    status: order.status,
    fromStatus,
    toStatus,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    itemCount: items.length,
    locationId: order.locationId,
    customerId: order.customerId,
  };
}
