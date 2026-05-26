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
  PICKING: 'order.picking',
  PICKED: 'order.picked',
  PREPARING: 'order.preparing',
  READY: 'order.ready',
  HANDED_TO_DRIVER: 'order.handed_to_driver',
  OUT_FOR_DELIVERY: 'order.out_for_delivery',
  COMPLETED: 'order.completed',
  REFUNDED: 'order.refunded',
  CANCELLED: 'order.cancelled',
  FAILED: 'order.failed',
} as const;
