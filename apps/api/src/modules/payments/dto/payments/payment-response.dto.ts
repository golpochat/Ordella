import { PaymentProvider } from '../../enums/payment-provider.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

export class PaymentResponseDto {
  id!: string;
  tenantId!: string;
  orderId!: string;
  provider!: PaymentProvider;
  method!: string;
  amount!: string;
  currency!: string;
  status!: PaymentStatus;
  providerPaymentId!: string | null;
  paymentMethodId!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
