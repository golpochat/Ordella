import { IsArray, IsDateString, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import {
  MarketingCampaignAutomationType,
  MarketingCampaignStatus,
  MarketingCampaignType,
  MarketingScheduleType,
} from '../entities';

export class CreateMarketingCampaignDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(MarketingCampaignType)
  type!: MarketingCampaignType;

  @IsOptional()
  @IsEnum(MarketingCampaignAutomationType)
  campaignType?: MarketingCampaignAutomationType;

  @IsOptional()
  @IsArray()
  channels?: MarketingCampaignType[];

  @IsUUID()
  segmentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsDateString()
  scheduleAt?: string;

  @IsOptional()
  @IsEnum(MarketingScheduleType)
  scheduleType?: MarketingScheduleType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recurrenceRule?: string;

  @IsOptional()
  @IsEnum(MarketingCampaignStatus)
  status?: MarketingCampaignStatus;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  campaignCategory?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  frequencyCap?: number;

  @IsOptional()
  @IsObject()
  safetyRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateMarketingCampaignDto extends CreateMarketingCampaignDto {}
