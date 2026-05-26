import { IsArray, IsEmail, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { AppPricingModel } from '../entities';

export class MarketplaceQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class RegisterPartnerDto {
  @IsString()
  companyName!: string;

  @IsString()
  contactName!: string;

  @IsEmail()
  email!: string;
}

export class SubmitAppDto {
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  provider!: string;

  @IsString()
  category!: string;

  @IsIn(['free', 'one_time', 'monthly_subscription', 'usage_based', 'revenue_share'])
  pricingModel!: AppPricingModel;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsString()
  usageUnit?: 'api_calls' | 'orders_processed';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  revenueShareBps?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requestedScopes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  webhookEvents?: string[];

  @IsOptional()
  @IsString()
  docsUrl?: string;
}

export class ApproveAppDto {
  @IsIn(['approved', 'rejected', 'sandbox'])
  status!: 'approved' | 'rejected' | 'sandbox';
}

export class SubmitVersionDto {
  @IsString()
  version!: string;

  @IsOptional()
  @IsString()
  changelog?: string;

  @IsOptional()
  @IsObject()
  manifest?: Record<string, unknown>;
}

export class InstallAppDto {
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
}

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class MeterUsageDto {
  @IsString()
  metric!: 'api_calls' | 'orders_processed' | 'sales_cents';

  @IsInt()
  @Min(1)
  quantity!: number;
}
