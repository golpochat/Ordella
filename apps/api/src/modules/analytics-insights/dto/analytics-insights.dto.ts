import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnalyticsInsightsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}

export class UpdateAnalyticsInsightSettingsDto {
  @IsOptional()
  @IsObject()
  segmentationRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  ltvParameters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  churnThresholds?: Record<string, unknown>;
}
