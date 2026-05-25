import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
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
