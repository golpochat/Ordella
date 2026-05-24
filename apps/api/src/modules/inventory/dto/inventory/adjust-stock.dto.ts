import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { StockAdjustmentType } from '../../enums/stock-adjustment-type.enum';

/** InventoryAdjustment — manual stock correction */
export class AdjustStockDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsEnum(StockAdjustmentType)
  type!: StockAdjustmentType;

  @IsNumber()
  delta!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
