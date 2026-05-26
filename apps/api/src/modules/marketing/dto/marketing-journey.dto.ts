import { IsArray, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { MarketingCampaignStatus } from '../entities';

export class UpsertMarketingJourneyDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(64)
  trigger!: 'signup' | 'first_order' | 'churn_risk' | 'birthday' | 'tier_upgrade' | 'abandoned_cart' | 'low_stock';

  @IsOptional()
  @IsUUID()
  targetSegmentId?: string;

  @IsOptional()
  @IsEnum(MarketingCampaignStatus)
  status?: MarketingCampaignStatus;

  @IsArray()
  channels!: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  frequencyCap?: number;

  @IsArray()
  steps!: Array<Record<string, unknown>>;

  @IsOptional()
  @IsObject()
  safetyRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class TrackMarketingEventDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  @MaxLength(64)
  eventType!: 'view' | 'click' | 'purchase' | 'signup' | 'abandoned_cart' | 'low_stock_alert' | 'unsubscribe';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsUUID()
  journeyId?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}
