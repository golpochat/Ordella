import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PartnerPortalLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class SubmitPartnerApplicationDto {
  @IsOptional()
  @IsString()
  tierKey?: string;

  @IsOptional()
  @IsObject()
  certifications?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionCodes?: string[];

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdatePartnerVerificationDto {
  @IsString()
  checkKey!: string;

  @IsIn(['passed', 'failed'])
  status!: 'passed' | 'failed';

  @IsOptional()
  @IsObject()
  result?: Record<string, unknown>;
}

export class UpdatePartnerTrainingProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePartnerApplicationDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  comment?: string;
}

export class LinkClientTenantDto {
  @IsUUID()
  clientTenantId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRegionCodes?: string[];

  @IsOptional()
  @IsObject()
  sla?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  provisionState?: string;
}

export class CreateMarketplaceItemDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @IsIn(['integration', 'automation', 'hardware_bundle'])
  itemType!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionCodes?: string[];

  @IsOptional()
  @IsUUID()
  linkedAppId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class MarketplaceQueryDto {
  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsIn(['integration', 'automation', 'hardware_bundle'])
  itemType?: string;
}

export class InstallAppOnBehalfDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  grantedScopes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  webhookEvents?: string[];

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class RevenueShareQueryDto {
  @IsString()
  periodStart!: string;

  @IsString()
  periodEnd!: string;
}

export class CreatePartnerSupportTicketDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  subject!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsUUID()
  clientTenantId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SubmitCommissionPayoutDto {
  @IsString()
  periodStart!: string;

  @IsString()
  periodEnd!: string;
}

export class CreatePartnerPortalUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  roleTitle?: string;

  @IsString()
  password!: string;
}

