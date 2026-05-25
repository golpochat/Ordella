import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { StoreCreditTransactionType } from '../entities';

export class StoreCreditMutationDto {
  @IsUUID()
  customerId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsEnum(StoreCreditTransactionType)
  type?: StoreCreditTransactionType;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class StoreCreditDeductDto {
  @IsUUID()
  customerId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class StoreCreditHistoryQueryDto {
  @IsUUID()
  customerId!: string;
}
