import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import type { ForecastModelType, ForecastType } from '../entities';

const forecastTypes = ['demand', 'inventory', 'staffing', 'delivery_capacity', 'warehouse_replenishment', 'summary'] as const;
const modelTypes = ['simple', 'exponential_smoothing', 'ai_embedding'] as const;

export class ForecastQueryDto {
  @IsOptional()
  @IsEnum(forecastTypes)
  forecastType?: ForecastType;

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
  @IsDateString()
  generatedForDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}

export class GenerateForecastDto extends ForecastQueryDto {
  @IsOptional()
  @IsBoolean()
  refresh?: boolean;
}

export class UpdateForecastModelDto {
  @IsEnum(modelTypes)
  modelType!: ForecastModelType;

  @IsObject()
  parameters!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
