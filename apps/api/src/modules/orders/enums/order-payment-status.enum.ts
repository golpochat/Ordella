/** Payment state on the order header (not the Payments module payment record). */
export enum OrderPaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PAYMENT_FAILED = 'payment_failed',
}
