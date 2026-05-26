import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import type { ReplenishmentRuleType } from '../entities';

const ruleTypes = ['min_max', 'forecast_based', 'safety_stock'] as const;

export class RunReplenishmentDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class ReplenishmentDashboardQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  horizonDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  riskWindowDays?: number;
}

export class GeneratePurchaseOrderSuggestionsDto extends ReplenishmentDashboardQueryDto {
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}

export class ApproveSuggestedPurchaseOrderLineDto {
  @IsUUID()
  itemId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantityOrdered!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;
}

export class ApproveSuggestedPurchaseOrderDto {
  @IsUUID()
  purchaseOrderId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproveSuggestedPurchaseOrderLineDto)
  items?: ApproveSuggestedPurchaseOrderLineDto[];
}

export class UpsertReplenishmentRuleDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  locationId!: string;

  @IsUUID()
  itemId!: string;

  @IsEnum(ruleTypes)
  ruleType!: ReplenishmentRuleType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reorderMultiple?: number;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReplenishmentActionQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsUUID()
  itemId?: string;
}
