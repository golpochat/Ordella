import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../orders/enums/order-type.enum';
import { SubscriptionSchedule, SubscriptionStatus } from '../entities';

export class SubscriptionItemDto {
  @IsUUID()
  itemId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsObject()
  modifiers?: Record<string, unknown>;
}

export class CreateSubscriptionDto {
  @IsUUID()
  customerId!: string;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsEnum(SubscriptionSchedule)
  schedule!: SubscriptionSchedule;

  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @IsNumber()
  @Min(0.01)
  totalPrice!: number;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsObject()
  deliveryDetails?: Record<string, unknown>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items!: SubscriptionItemDto[];
}

export class StorefrontCreateSubscriptionDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsEnum(SubscriptionSchedule)
  schedule!: SubscriptionSchedule;

  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @IsNumber()
  @Min(0.01)
  totalPrice!: number;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsObject()
  deliveryDetails?: Record<string, unknown>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items!: SubscriptionItemDto[];
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionSchedule)
  schedule?: SubscriptionSchedule;

  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsObject()
  deliveryDetails?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items?: SubscriptionItemDto[];
}
