import { OrderEntity } from '../../orders/entities/order.entity';
import { KdsOrderItemStateEntity } from '../entities/kds-order-item-state.entity';
import { KdsLineStatus } from '../enums/kds-line-status.enum';
import { KdsOrderDetailView, KdsOrderSummaryView, KdsLineItemView } from '../types/kds-order.views';

export function mapKdsLineItems(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
): KdsLineItemView[] {
  const stateByItem = new Map(states.map((state) => [state.orderItemId, state]));

  return (order.items ?? []).map((item) => {
    const state = stateByItem.get(item.id);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      notes: item.notes,
      kdsStatus: state?.status ?? KdsLineStatus.PENDING,
      station: state?.station ?? null,
      startedAt: state?.startedAt?.toISOString() ?? null,
      completedAt: state?.completedAt?.toISOString() ?? null,
    };
  });
}

export function mapKdsOrderSummary(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
): KdsOrderSummaryView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderType: order.orderType,
    locationId: order.locationId,
    createdAt: order.createdAt.toISOString(),
    lineItems: mapKdsLineItems(order, states),
  };
}

export function mapKdsOrderDetail(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
): KdsOrderDetailView {
  return {
    ...mapKdsOrderSummary(order, states),
    subtotal: order.subtotal,
    total: order.total,
    updatedAt: order.updatedAt?.toISOString() ?? null,
  };
}
