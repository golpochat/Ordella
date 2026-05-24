import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethodType } from '../../enums/payment-method-type.enum';
import { PaymentProvider } from '../../enums/payment-provider.enum';

/** SRS §9 — tenant / customer payment methods */
export class CreatePaymentMethodDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(PaymentMethodType)
  type!: PaymentMethodType;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsOptional()
  @IsString()
  displayLabel?: string;

  @IsOptional()
  @IsString()
  lastFour?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  providerToken?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
