import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LoyaltyRewardType } from '../entities';

export class UpsertLoyaltyTierDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(80)
  name!: string;

  @IsInt()
  @Min(0)
  pointsThreshold!: number;

  @IsNumber()
  @Min(0)
  spendThreshold!: number;

  @IsNumber()
  @Min(0)
  pointsMultiplier!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsArray()
  perks?: string[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertLoyaltyRewardDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsIn(['voucher', 'discount', 'free_item'])
  type!: LoyaltyRewardType;

  @IsInt()
  @Min(0)
  pointsCost!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsUUID()
  freeItemId?: string;

  @IsOptional()
  @IsArray()
  tierNames?: string[];

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateReferralDto {
  @IsUUID()
  referrerCustomerId!: string;

  @IsOptional()
  @IsUUID()
  referredCustomerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  code?: string;
}
