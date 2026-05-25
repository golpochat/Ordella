import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateLoyaltySettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  earnRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  redeemRate?: number;

  @IsOptional()
  @IsBoolean()
  autoEnroll?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minRedeemPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxRedeemPercent?: number;
}
