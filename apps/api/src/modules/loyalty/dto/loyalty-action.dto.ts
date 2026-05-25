import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class LoyaltyAdjustmentDto {
  @IsUUID()
  customerId!: string;

  @IsInt()
  points!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class LoyaltyRedeemQuoteDto {
  @IsUUID()
  customerId!: string;

  @IsInt()
  @Min(1)
  points!: number;

  @IsOptional()
  orderTotal?: string;
}
