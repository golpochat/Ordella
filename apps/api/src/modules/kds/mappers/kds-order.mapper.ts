import { OrderEntity } from '../../orders/entities/order.entity';
import { KdsOrderItemStateEntity } from '../entities/kds-order-item-state.entity';
import { KdsLineStatus } from '../enums/kds-line-status.enum';
import { FulfillmentDisplayStatus } from '../enums/fulfillment-display-status.enum';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import {
  FulfillmentCustomerInfo,
  KdsOrderDetailView,
  KdsOrderSummaryView,
  KdsLineItemView,
} from '../types/kds-order.views';

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

export function mapFulfillmentDisplayStatus(status: OrderStatus): FulfillmentDisplayStatus {
  switch (status) {
    case OrderStatus.ACCEPTED:
      return FulfillmentDisplayStatus.NEW;
    case OrderStatus.PREPARING:
      return FulfillmentDisplayStatus.IN_PROGRESS;
    case OrderStatus.READY:
    case OrderStatus.OUT_FOR_DELIVERY:
      return FulfillmentDisplayStatus.READY;
    case OrderStatus.COMPLETED:
      return FulfillmentDisplayStatus.COMPLETED;
    default:
      return FulfillmentDisplayStatus.NEW;
  }
}

function mapCustomerInfo(order: OrderEntity): FulfillmentCustomerInfo | null {
  const delivery = order.deliveryDetails;
  if (!delivery) {
    return null;
  }
  const phone = delivery.contactPhone ?? undefined;
  const name =
    delivery.addressLine1 && delivery.city
      ? `${delivery.addressLine1}, ${delivery.city}`
      : delivery.addressLine1 ?? undefined;
  if (!phone && !name) {
    return null;
  }
  return { name, phone };
}

export function mapKdsOrderSummary(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
  catalog?: KdsCatalogLookup,
  driverInfo?: {
    driverStatus?: string | null;
    driverStatusLabel?: string | null;
    driverName?: string | null;
  },
): KdsOrderSummaryView {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    fulfillmentStatus: mapFulfillmentDisplayStatus(order.status),
    orderType: order.orderType,
    locationId: order.locationId,
    createdAt: order.createdAt.toISOString(),
    customerInfo: mapCustomerInfo(order),
    lineItems: mapKdsLineItems(order, states, catalog),
    driverStatus: driverInfo?.driverStatus ?? null,
    driverStatusLabel: driverInfo?.driverStatusLabel ?? null,
    driverName: driverInfo?.driverName ?? null,
  };
}

export function mapKdsOrderDetail(
  order: OrderEntity,
  states: KdsOrderItemStateEntity[],
  catalog?: KdsCatalogLookup,
  driverInfo?: {
    driverStatus?: string | null;
    driverStatusLabel?: string | null;
    driverName?: string | null;
  },
): KdsOrderDetailView {
  return {
    ...mapKdsOrderSummary(order, states, catalog, driverInfo),
    subtotal: order.subtotal,
    total: order.total,
    updatedAt: order.updatedAt?.toISOString() ?? null,
  };
}
