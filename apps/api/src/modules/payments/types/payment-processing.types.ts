import { PaymentStatus } from '../enums/payment-status.enum';

export type PaymentAuthorizationStatus = 'authorized' | 'captured' | 'skipped' | 'failed';

export interface AuthorizeOrCaptureResult {
  paymentId: string;
  status: PaymentAuthorizationStatus;
  failureReason?: string;
}

export interface RefundResult {
  refundId: string;
  status: 'succeeded' | 'skipped' | 'failed';
  failureReason?: string;
}

export interface PaymentIntentResult {
  paymentId: string;
  status: PaymentStatus;
}

export interface RecordAttemptInput {
  paymentId: string;
  status: import('../enums/payment-attempt-status.enum').PaymentAttemptStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  providerResponse?: Record<string, unknown>;
}
