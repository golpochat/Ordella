/**
 * Domain naming aliases (table names unchanged).
 * - Payment → payments
 * - PaymentAttempt → payment_attempts
 * - Refund → refunds
 */
export { PaymentEntity as PaymentRecordEntity } from '../entities/payment.entity';
export { PaymentAttemptEntity as PaymentAttemptRecordEntity } from '../entities/payment-attempt.entity';
export { RefundEntity as RefundRecordEntity } from '../entities/refund.entity';
