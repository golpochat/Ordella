import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

/** SRS §4.3 — manual stock adjustment */
export class CreateStockAdjustmentDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsNumber()
  quantityDelta!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
