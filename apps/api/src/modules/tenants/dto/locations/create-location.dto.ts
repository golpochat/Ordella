import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { LocationStatus } from '../../enums/location-status.enum';

const fulfillmentModes = ['storefront', 'pos', 'dark_store', 'micro_fulfillment'] as const;

/** API Spec §2.2 POST /api/v1/locations */
export class CreateLocationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(fulfillmentModes)
  fulfillmentMode?: 'storefront' | 'pos' | 'dark_store' | 'micro_fulfillment';
}
