export const PaymentsDomainEvents = {
  PAYMENT_CREATED: 'payments.payment.created',
  PAYMENT_SUCCEEDED: 'payments.payment.succeeded',
  PAYMENT_FAILED: 'payments.payment.failed',
  REFUND_CREATED: 'payments.refund.created',
  REFUND_SUCCEEDED: 'payments.refund.succeeded',
  PAYMENT_ATTEMPT_RECORDED: 'payments.payment_attempt.recorded',
} as const;
