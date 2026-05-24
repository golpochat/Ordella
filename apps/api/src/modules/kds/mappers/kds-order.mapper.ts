import { OrderEntity } from '../../orders/entities/order.entity';
import { KdsOrderItemStateEntity } from '../entities/kds-order-item-state.entity';
import { KdsLineStatus } from '../enums/kds-line-status.enum';
import { KdsOrderDetailView, KdsOrderSummaryView, KdsLineItemView } from '../types/kds-order.views';

export type KdsCatalogLookup = {
  products: Map<string, { name: string; sku: string | null }>;
  variants: Map<string, { name: string; sku: string | null }>;
};

export function mapKdsLineItems(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
  catalog?: KdsCatalogLookup,
): KdsLineItemView[] {
  const stateByItem = new Map(states.map((state) => [state.orderItemId, state]));

  return (order.items ?? []).map((item) => {
    const state = stateByItem.get(item.id);
    const product = catalog?.products.get(item.productId);
    const variant = item.variantId ? catalog?.variants.get(item.variantId) : undefined;

    return {
      id: item.id,
      productId: item.productId,
      itemName: product?.name ?? 'Item',
      variantId: item.variantId,
      variantName: variant?.name ?? null,
      sku: variant?.sku ?? product?.sku ?? null,
      modifiers: [],
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
  catalog?: KdsCatalogLookup,
): KdsOrderSummaryView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderType: order.orderType,
    locationId: order.locationId,
    createdAt: order.createdAt.toISOString(),
    lineItems: mapKdsLineItems(order, states, catalog),
  };
}

export function mapKdsOrderDetail(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
  catalog?: KdsCatalogLookup,
): KdsOrderDetailView {
  return {
    ...mapKdsOrderSummary(order, states, catalog),
    subtotal: order.subtotal,
    total: order.total,
    updatedAt: order.updatedAt?.toISOString() ?? null,
  };
}
