import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OnlineOrderType } from '../enums/online-order-type.enum';

class CheckoutSessionItemDto {
  @IsUUID()
  itemId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifiers?: string[];

  @IsNumber()
  @Min(1)
  quantity!: number;
}

class CheckoutSessionCustomerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}

class CheckoutSessionDeliveryDto {
  @IsString()
  @MaxLength(255)
  addressLine1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsString()
  @MaxLength(120)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  instructions?: string;
}

class CheckoutSessionTotalsDto {
  @IsString()
  grandTotal!: string;

  @IsOptional()
  @IsString()
  subtotal?: string;

  @IsOptional()
  @IsString()
  taxTotal?: string;
}

/** POST /payments/checkout-session — Stripe Checkout for online orders */
export class CreateCheckoutSessionDto {
  @IsUUID()
  locationId!: string;

  @IsEnum(OnlineOrderType)
  orderType!: OnlineOrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutSessionItemDto)
  items!: CheckoutSessionItemDto[];

  @ValidateNested()
  @Type(() => CheckoutSessionCustomerDto)
  customer!: CheckoutSessionCustomerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutSessionDeliveryDto)
  delivery?: CheckoutSessionDeliveryDto;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;

  @ValidateNested()
  @Type(() => CheckoutSessionTotalsDto)
  totals!: CheckoutSessionTotalsDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  loyaltyRedeemPoints?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  giftCardCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  giftCardAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  storeCreditAmount?: number;
}
