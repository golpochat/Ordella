import { RefundStatus } from '../../enums/refund-status.enum';

export class RefundResponseDto {
  id!: string;
  paymentId!: string;
  amount!: string;
  reason!: string | null;
  status!: RefundStatus;
  providerRefundId!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
