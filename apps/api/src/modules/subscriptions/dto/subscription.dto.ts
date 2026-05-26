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
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../orders/enums/order-type.enum';
import {
  SubscriptionBillingCycle,
  SubscriptionPlanStatus,
  SubscriptionSchedule,
  SubscriptionStatus,
} from '../entities';

export class UpsertSubscriptionPlanDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(SubscriptionBillingCycle)
  billingCycle!: SubscriptionBillingCycle;

  @IsObject()
  perks!: {
    freeDelivery?: boolean;
    discounts?: number;
    discountPercent?: number;
    pointsMultiplier?: number;
    exclusiveItems?: string[];
    description?: string[];
  };

  @IsOptional()
  @IsInt()
  @Min(0)
  trialPeriod?: number;

  @IsOptional()
  @IsEnum(SubscriptionPlanStatus)
  status?: SubscriptionPlanStatus;
}

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
  @IsUUID()
  planId?: string;

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

export class SubscribeToPlanDto {
  @IsUUID()
  planId!: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsObject()
  refundPolicy?: Record<string, unknown>;
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
  @IsString()
  paymentMethod?: string;

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
