import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../enums/payment-status.enum';

/** API Spec §6.1 PATCH /api/v1/payments/{id} */
export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  providerPaymentId?: string;
}
