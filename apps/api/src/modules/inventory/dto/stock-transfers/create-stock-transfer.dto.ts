import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateStockTransferLineDto } from './create-stock-transfer-line.dto';
import { StockTransferStatus } from '../../enums/stock-transfer-status.enum';

/** API Spec §4.3 POST /api/v1/stock-transfers */
export class CreateStockTransferDto {
  @IsUUID()
  fromLocationId!: string;

  @IsUUID()
  toLocationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStockTransferLineDto)
  lines!: CreateStockTransferLineDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(StockTransferStatus)
  status?: StockTransferStatus;
}
