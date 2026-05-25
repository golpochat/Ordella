import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { LoyaltyTransactionType } from '../entities';

export class LoyaltyTransactionQueryDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(LoyaltyTransactionType)
  type?: LoyaltyTransactionType;

  @IsOptional()
  from?: string;

  @IsOptional()
  to?: string;
}
