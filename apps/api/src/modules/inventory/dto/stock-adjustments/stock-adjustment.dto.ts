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

export class StockAdjustmentResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  locationId!: string;
  quantityDelta!: string;
  reason!: string | null;
  adjustedBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
