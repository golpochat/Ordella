/** API Spec §5.7 — order status flow */
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKING = 'picking',
  PICKED = 'picked',
  PREPARING = 'preparing',
  READY = 'ready',
  HANDED_TO_DRIVER = 'handed_to_driver',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}
