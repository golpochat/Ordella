import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { MarketingCampaignType } from '../entities';

export class CreateMarketingCampaignDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(MarketingCampaignType)
  type!: MarketingCampaignType;

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
}

export class UpdateMarketingCampaignDto extends CreateMarketingCampaignDto {}
