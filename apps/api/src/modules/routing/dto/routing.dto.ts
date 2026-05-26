import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import type { RoutingRuleType } from '../entities';

const ruleTypes = ['distance', 'stock', 'capacity', 'priority', 'delivery_zone'] as const;

class RoutingAddressDto {
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;
}

class RoutingLineDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class DecideRoutingDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  fromLocationId?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  orderSubtotal?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingAddressDto)
  customerAddress?: RoutingAddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingLineDto)
  items?: RoutingLineDto[];
}

export class UpsertRoutingRuleDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(ruleTypes)
  ruleType!: RoutingRuleType;

  @IsObject()
  value!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoutingDecisionQueryDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}
