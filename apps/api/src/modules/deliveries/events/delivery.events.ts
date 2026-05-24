export const DeliveryDomainEvents = {
  DELIVERY_TASK_CREATED: 'delivery.task.created',
  DELIVERY_TASK_STATUS_CHANGED: 'delivery.task.status_changed',
  DELIVERY_OUT_FOR_DELIVERY: 'delivery.out_for_delivery',
  DELIVERY_ASSIGNED: 'delivery.assigned',
  DELIVERY_DELIVERED: 'delivery.delivered',
  DELIVERY_FAILED: 'delivery.failed',
  DELIVERY_COMPLETED: 'delivery.completed',
  DRIVER_PROFILE_CREATED: 'delivery.driver_profile.created',
} as const;
