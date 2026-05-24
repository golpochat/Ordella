export enum DeliveryTaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  EN_ROUTE_TO_STORE = 'en_route_to_store',
  PICKED_UP = 'picked_up',
  EN_ROUTE_TO_CUSTOMER = 'en_route_to_customer',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
