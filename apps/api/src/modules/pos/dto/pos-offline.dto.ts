import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
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
import { PosContextDto } from './pos-context.dto';

export class PosOfflineSessionDto extends PosContextDto {
  @IsUUID()
  locationId!: string;
}

export class PosOfflineLineDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsUUID()
  bundleId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  modifierOptionIds?: string[];

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PosOfflineCustomerDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  localCustomerId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class PosOfflineTotalsDto {
  @IsString()
  subtotal!: string;

  @IsString()
  discountTotal!: string;

  @IsString()
  tax!: string;

  @IsString()
  total!: string;
}

export class PosOfflineOrderDto {
  @IsUUID()
  clientOrderId!: string;

  @ValidateNested()
  @Type(() => PosOfflineSessionDto)
  session!: PosOfflineSessionDto;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsIn(['cash', 'card', 'pos', 'external'])
  paymentMethod!: 'cash' | 'card' | 'pos' | 'external';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosOfflineLineDto)
  lines!: PosOfflineLineDto[];

  @IsOptional()
  @IsString()
  orderNotes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PosOfflineCustomerDto)
  customer?: PosOfflineCustomerDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  loyaltyRedeemPoints?: number;

  @IsOptional()
  @IsString()
  giftCardCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  giftCardAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  storeCreditAmount?: number;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountFixed?: number;

  @ValidateNested()
  @Type(() => PosOfflineTotalsDto)
  totals!: PosOfflineTotalsDto;

  @IsArray()
  @IsString({ each: true })
  flags!: string[];

  @IsString()
  createdAt!: string;
}

export class PosOfflineEventDto {
  @IsString()
  type!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  createdAt!: string;
}

export class PosOfflineSyncOrdersDto extends PosContextDto {
  @IsUUID()
  locationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosOfflineOrderDto)
  orders!: PosOfflineOrderDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosOfflineEventDto)
  events?: PosOfflineEventDto[];
}

export class PosOfflineInventoryAdjustmentDto {
  @IsString()
  id!: string;

  @IsUUID()
  productId!: string;

  @IsNumber()
  quantityDelta!: number;

  @IsString()
  reason!: string;

  @IsString()
  createdAt!: string;
}

export class PosOfflineSyncInventoryDto extends PosContextDto {
  @IsUUID()
  locationId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosOfflineInventoryAdjustmentDto)
  adjustments!: PosOfflineInventoryAdjustmentDto[];
}
