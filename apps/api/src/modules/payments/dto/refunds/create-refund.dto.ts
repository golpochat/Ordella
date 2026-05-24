import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/** API Spec §6.2 POST /api/v1/refunds */
export class CreateRefundDto {
  @IsUUID()
  paymentId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
