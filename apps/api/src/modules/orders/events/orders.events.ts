export const OrdersDomainEvents = {
  ORDER_CREATED: 'orders.order.created',
  ORDER_STATUS_CHANGED: 'orders.order.status_changed',
  ORDER_CANCELLED: 'orders.order.cancelled',
  ORDER_ITEM_ADDED: 'orders.order_item.added',
  ORDER_ITEM_REMOVED: 'orders.order_item.removed',
} as const;
