import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { StockMovementType } from '../../enums/stock-movement-type.enum';
import { StockReferenceType } from '../../enums/stock-reference-type.enum';

/** API Spec §4.2 POST /api/v1/stock-movements */
export class CreateStockMovementDto {
  @IsUUID()
  stockItemId!: string;

  @IsEnum(StockMovementType)
  type!: StockMovementType;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsEnum(StockReferenceType)
  referenceType?: StockReferenceType;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
