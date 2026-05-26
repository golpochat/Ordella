/** User-facing labels for order channels, types, and statuses (API values unchanged). */

export const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  dine_in: 'In-store',
  pos: 'In-store (POS)',
  online: 'Online',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order received',
  accepted: 'Confirmed',
  picking: 'Picking',
  picked: 'Picked',
  preparing: 'In fulfillment',
  ready: 'Ready',
  handed_to_driver: 'Handed to driver',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Failed',
};

export const ORDER_CHANNEL_LABELS: Record<string, string> = {
  online: 'Online',
  pos: 'In-store (POS)',
  delivery: 'Delivery',
  pickup: 'Pickup',
  dine_in: 'In-store',
};

export function labelOrderType(value: string): string {
  return ORDER_TYPE_LABELS[value] ?? value.replace(/_/g, ' ');
}

export function labelOrderStatus(value: string): string {
  return ORDER_STATUS_LABELS[value] ?? value.replace(/_/g, ' ');
}

export function labelOrderChannel(value: string): string {
  return ORDER_CHANNEL_LABELS[value] ?? value.replace(/_/g, ' ');
}
