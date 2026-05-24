import { OrderType } from '../../orders/enums/order-type.enum';

const CHANNEL_LABELS: Record<string, string> = {
  [OrderType.POS]: 'POS (in-store)',
  [OrderType.DINE_IN]: 'POS (in-store)',
  [OrderType.PICKUP]: 'Pickup',
  [OrderType.DELIVERY]: 'Delivery',
  [OrderType.ONLINE]: 'Online storefront',
  in_store: 'POS (in-store)',
};

export function labelSalesChannel(orderType: string): string {
  return CHANNEL_LABELS[orderType] ?? 'Other';
}

export function groupChannelKey(orderType: string): string {
  if (orderType === OrderType.POS || orderType === OrderType.DINE_IN || orderType === 'in_store') {
    return 'pos';
  }
  if (orderType === OrderType.ONLINE || orderType === 'online') {
    return 'online';
  }
  if (orderType === OrderType.DELIVERY) {
    return 'delivery';
  }
  if (orderType === OrderType.PICKUP) {
    return 'pickup';
  }
  return orderType;
}
