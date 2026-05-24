import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '../../enums/order-type.enum';

class PosCreateOrderItemDto {
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

  @IsString()
  price!: string;
}

class PosCreateOrderCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}

class PosCreateOrderTotalsDto {
  @IsOptional()
  @IsString()
  subtotal?: string;

  @IsOptional()
  @IsString()
  tax?: string;

  @IsOptional()
  @IsString()
  total?: string;
}

/** POST /orders/create — retail POS order creation */
export class PosCreateOrderDto {
  @IsUUID()
  locationId!: string;

  @IsEnum(OrderType)
  orderType!: OrderType;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosCreateOrderItemDto)
  items!: PosCreateOrderItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PosCreateOrderCustomerDto)
  customer?: PosCreateOrderCustomerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PosCreateOrderTotalsDto)
  totals?: PosCreateOrderTotalsDto;
}
