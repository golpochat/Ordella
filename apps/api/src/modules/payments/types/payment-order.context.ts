/** Order payment context without importing the Orders module. */
export interface PaymentOrderContext {
  tenantId: string;
  orderId: string;
  amount: string;
  currency: string;
  method: string;
  customerId?: string | null;
  reason?: string;
  /** Stripe PaymentIntent id (pi_…) when payment was collected via Stripe */
  stripePaymentIntentId?: string | null;
}
