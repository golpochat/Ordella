import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  businessInfo?: Record<string, unknown>;
}

export class UpdateLogoDto {
  @IsString()
  @MaxLength(2048)
  logoUrl!: string;
}
