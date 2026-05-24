import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PosContextDto } from './pos-context.dto';
import { PosPaymentMethod } from '../enums/pos-payment-method.enum';

/** POST /pos/payment */
export class PosPaymentDto extends PosContextDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(PosPaymentMethod)
  method!: PosPaymentMethod;

  @IsOptional()
  @IsString()
  currency?: string;

  /** Stripe PaymentIntent id after Terminal / card reader collection */
  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;
}
