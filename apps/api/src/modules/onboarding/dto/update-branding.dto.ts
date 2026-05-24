import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ThemePreset } from '../types/tenant-theme.types';

class ThemeColorsDto {
  @IsOptional()
  @IsString()
  primary?: string;

  @IsOptional()
  @IsString()
  secondary?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  surface?: string;
}

class ThemeTypographyDto {
  @IsOptional()
  @IsString()
  sm?: string;

  @IsOptional()
  @IsString()
  md?: string;

  @IsOptional()
  @IsString()
  lg?: string;
}

class TenantThemeDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'custom'])
  preset?: ThemePreset;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeTypographyDto)
  typography?: ThemeTypographyDto;

  @IsOptional()
  @IsString()
  iconUrl?: string | null;
}

export class UpdateBrandingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TenantThemeDto)
  theme?: TenantThemeDto;

  @IsOptional()
  @IsObject()
  businessInfo?: Record<string, unknown>;
}

export class UpdateLogoDto {
  @IsString()
  @MaxLength(2048)
  logoUrl!: string;
}

export class UpdateIconDto {
  @IsString()
  @MaxLength(2048)
  iconUrl!: string;
}
