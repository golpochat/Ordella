import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentProvider } from '../../enums/payment-provider.enum';

/** API Spec §6.1 POST /api/v1/payments */
export class CreatePaymentDto {
  @IsUUID()
  orderId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsString()
  method!: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
