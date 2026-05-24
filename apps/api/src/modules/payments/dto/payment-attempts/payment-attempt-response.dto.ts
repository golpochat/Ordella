import { PaymentAttemptStatus } from '../../enums/payment-attempt-status.enum';

export class PaymentAttemptResponseDto {
  id!: string;
  paymentId!: string;
  attemptNumber!: number;
  status!: PaymentAttemptStatus;
  providerResponse!: Record<string, unknown>;
  errorMessage!: string | null;
  createdAt!: Date;
}
