import { IsBoolean, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import type { BaseTheme, ThemeAssetType } from '../entities';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsIn(['default', 'modern', 'minimal', 'bold'])
  baseTheme?: BaseTheme;

  @IsOptional()
  @IsIn(['light', 'dark', 'custom'])
  preset?: 'light' | 'dark' | 'custom';

  @IsOptional()
  @IsObject()
  colors?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  typography?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  posTheme?: Record<string, unknown>;

  @IsOptional()
  homepageSections?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsObject()
  assets?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  seo?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UploadThemeAssetDto {
  @IsIn(['logo', 'banner', 'background', 'favicon'])
  type!: ThemeAssetType;

  @IsString()
  @MaxLength(2048)
  url!: string;
}
