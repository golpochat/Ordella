import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pointsExpireDays?: number;

  @IsOptional()
  @IsBoolean()
  referralEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  referrerBonusPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  refereeBonusPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDailyRedemptions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDailyReferrals?: number;
}
