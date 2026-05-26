import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AdminUpdateTenantLocalizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currencySymbol?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  dateFormat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  numberFormat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultTaxRate?: number;
}

