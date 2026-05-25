import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import type { RecommendationEventType } from '../entities';

export class RecommendationQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  itemIds?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number;
}

export class RecommendationEventDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsUUID()
  itemId!: string;

  @IsIn(['view', 'add_to_cart', 'purchase', 'impression', 'click'])
  eventType!: RecommendationEventType;

  @IsOptional()
  @IsString()
  source?: string;
}

export class RecommendationSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  personalizationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  cartUpsellsEnabled?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(12)
  maxRecommendations?: number;
}
