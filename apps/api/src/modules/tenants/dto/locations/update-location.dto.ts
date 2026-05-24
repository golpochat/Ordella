import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { LocationStatus } from '../../enums/location-status.enum';

/** API Spec §2.2 PATCH /api/v1/locations/{id} */
export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

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
}
