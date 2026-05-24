export const OrdersPermissionKeys = {
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_CANCEL: 'orders:cancel',
} as const;

/** Blueprint §2.3 / packages/types event catalog */
export const OrderEventTypes = {
  CREATED: 'order.created',
  ACCEPTED: 'order.accepted',
  PREPARING: 'order.preparing',
  READY: 'order.ready',
  DISPATCHED: 'order.dispatched',
  DELIVERED: 'order.delivered',
  CANCELLED: 'order.cancelled',
  FAILED: 'order.failed',
} as const;
