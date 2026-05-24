import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const BUSINESS_TYPES = [
  'restaurant',
  'cafe',
  'takeaway',
  'grocery',
  'butcher',
  'retail',
  'clothing',
  'bakery',
  'pharmacy',
  'other',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export class UpdateBusinessDetailsDto {
  @IsString()
  @MaxLength(255)
  businessName!: string;

  @IsOptional()
  @IsIn(BUSINESS_TYPES)
  businessType?: BusinessType | null;

  @IsString()
  @MaxLength(8)
  currency!: string;

  @IsString()
  @MaxLength(64)
  timezone!: string;
}

class OpeningHoursDayDto {
  @IsNumber()
  @Min(0)
  dayOfWeek!: number;

  @IsOptional()
  @IsString()
  openTime?: string | null;

  @IsOptional()
  @IsString()
  closeTime?: string | null;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class UpdateLocationSetupDto {
  @IsOptional()
  @IsString()
  locationId?: string;

  @IsString()
  @MaxLength(255)
  locationName!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDayDto)
  openingHours?: OpeningHoursDayDto[];

  @IsOptional()
  @IsBoolean()
  pickupEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;
}

export class CatalogStarterItemDto {
  @IsString()
  @MaxLength(255)
  categoryName!: string;

  @IsString()
  @MaxLength(255)
  itemName!: string;

  @IsString()
  @MaxLength(32)
  price!: string;
}

export class CatalogStarterDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogStarterItemDto)
  firstItem?: CatalogStarterItemDto;
}

export class InitSampleCatalogDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @IsOptional()
  @IsIn(BUSINESS_TYPES)
  businessType?: BusinessType | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  fulfillmentEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pickupEnabled?: boolean;
}

export class UpdateOnboardingBrandingDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  receiptHeader?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  receiptFooter?: string;
}
