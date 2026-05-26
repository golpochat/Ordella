export interface DeliveryOrderContext {
  tenantId: string;
  orderId: string;
  eta?: Date | null;
  metadata?: Record<string, unknown>;
}

export interface DeliveryOrderTransitionContext {
  tenantId: string;
  orderId: string;
  toStatus: 'ready' | 'handed_to_driver' | 'out_for_delivery' | 'completed' | 'cancelled';
  reason?: string;
}
