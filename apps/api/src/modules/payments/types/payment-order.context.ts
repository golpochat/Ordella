/** Order payment context without importing the Orders module. */
export interface PaymentOrderContext {
  tenantId: string;
  orderId: string;
  amount: string;
  currency: string;
  method: string;
  customerId?: string | null;
  reason?: string;
}
