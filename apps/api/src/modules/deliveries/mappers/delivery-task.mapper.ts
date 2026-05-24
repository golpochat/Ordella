import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderType } from '../../orders/enums/order-type.enum';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';
import { DeliveryResponseDto } from '../dto/deliveries/delivery-response.dto';
import { DriverOrderResponseDto } from '../dto/driver-orders/driver-order-response.dto';

export function toDeliveryResponseDto(task: DeliveryTaskEntity): DeliveryResponseDto {
  return {
    id: task.id,
    tenantId: task.tenantId,
    orderId: task.orderId,
    driverId: task.driverId,
    status: task.status,
    eta: task.eta,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    metadata: task.metadata ?? {},
    deliveryFee: task.deliveryFee,
    notes: task.notes,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function formatDeliveryAddress(order: OrderEntity | null): string | null {
  const d = order?.deliveryDetails;
  if (!d) return null;
  return [d.addressLine1, d.addressLine2, d.city, d.postalCode].filter(Boolean).join(', ') || null;
}

export function enrichTaskMetadataFromOrder(
  task: DeliveryTaskEntity,
  order: OrderEntity | null,
  productNames?: Map<string, string>,
): Record<string, unknown> {
  const meta = { ...(task.metadata ?? {}) };
  const delivery = order?.deliveryDetails;

  if (delivery) {
    meta.dropoff = meta.dropoff ?? {
      addressLine1: delivery.addressLine1,
      addressLine2: delivery.addressLine2,
      city: delivery.city,
      postalCode: delivery.postalCode,
      instructions: delivery.instructions,
    };
    meta.customer = meta.customer ?? {
      name: meta.customerName ?? delivery.addressLine1,
      phone: delivery.contactPhone,
    };
  }

  if (order?.orderNumber) {
    meta.orderNumber = order.orderNumber;
  }

  if (order?.orderType) {
    meta.orderType = order.orderType;
  }

  if (order?.items?.length && productNames) {
    meta.orderItems = order.items.map((item) => ({
      name: productNames.get(item.productId) ?? 'Item',
      quantity: item.quantity,
    }));
  }

  if (!meta.customerName && typeof meta.customer === 'object' && meta.customer) {
    const c = meta.customer as { name?: string };
    meta.customerName = c.name;
  }

  return meta;
}

export function toDriverOrderResponseDto(
  task: DeliveryTaskEntity,
  order: OrderEntity | null,
  productNames?: Map<string, string>,
): DriverOrderResponseDto {
  const metadata = enrichTaskMetadataFromOrder(task, order, productNames);
  const orderType = (metadata.orderType as OrderType | undefined) ?? order?.orderType ?? OrderType.DELIVERY;
  const isPickup = orderType === OrderType.PICKUP;

  const itemsFromMeta = Array.isArray(metadata.orderItems)
    ? (metadata.orderItems as { name: string; quantity: number }[])
    : [];
  const itemsSummary =
    itemsFromMeta.length > 0
      ? itemsFromMeta
      : order?.items?.map((item) => ({
          name: productNames?.get(item.productId) ?? 'Item',
          quantity: item.quantity,
        })) ?? [];

  const customer = (metadata.customer as { name?: string; phone?: string } | undefined) ?? {};
  const customerName =
    (typeof metadata.customerName === 'string' ? metadata.customerName : null) ??
    customer.name ??
    'Customer';
  const customerPhone = customer.phone ?? order?.deliveryDetails?.contactPhone ?? '';

  return {
    id: task.id,
    orderId: task.orderId,
    orderNumber: order?.orderNumber ?? (metadata.orderNumber as string | null) ?? null,
    orderType,
    status: task.status,
    driverId: task.driverId,
    customerName,
    customerPhone,
    deliveryAddress: isPickup ? null : formatDeliveryAddress(order),
    itemsSummary,
    notes: task.notes,
    createdAt: task.createdAt.toISOString(),
    eta: task.eta?.toISOString() ?? null,
    metadata,
    isPickup,
  };
}
