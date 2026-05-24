/** API Spec §5.7 — order status flow */
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}
