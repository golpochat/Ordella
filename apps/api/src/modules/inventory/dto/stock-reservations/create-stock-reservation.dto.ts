import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { StockReferenceType } from '../../enums/stock-reference-type.enum';

/** SRS §4.3 — reserve stock on checkout */
export class CreateStockReservationDto {
  @IsUUID()
  stockItemId!: string;

  @IsUUID()
  locationId!: string;

  @IsNumber()
  quantity!: number;

  @IsEnum(StockReferenceType)
  referenceType!: StockReferenceType;

  @IsUUID()
  referenceId!: string;

  @IsOptional()
  expiresAt?: Date;
}
