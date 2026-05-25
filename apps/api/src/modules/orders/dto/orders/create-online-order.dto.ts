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
import { OnlineOrderType } from '../../../online/enums/online-order-type.enum';
import { OrderPaymentMethod } from '../../enums/order-payment-method.enum';

class CreateOnlineOrderItemDto {
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

  @IsOptional()
  @IsString()
  price?: string;
}

class CreateOnlineOrderCustomerDto {
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

class CreateOnlineOrderDeliveryDto {
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

/** POST /orders/create-online — storefront order placement */
export class CreateOnlineOrderDto {
  @IsUUID()
  locationId!: string;

  @IsEnum(OnlineOrderType)
  orderType!: OnlineOrderType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOnlineOrderItemDto)
  items!: CreateOnlineOrderItemDto[];

  @ValidateNested()
  @Type(() => CreateOnlineOrderCustomerDto)
  customer!: CreateOnlineOrderCustomerDto;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOnlineOrderDeliveryDto)
  delivery?: CreateOnlineOrderDeliveryDto;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;

  @IsOptional()
  @IsEnum(OrderPaymentMethod)
  paymentMethod?: OrderPaymentMethod;

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
