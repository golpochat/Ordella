import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { StockTransferStatus } from '../../enums/stock-transfer-status.enum';

export class StockTransferLineDto {
  @IsUUID()
  stockItemId!: string;

  @IsNumber()
  quantity!: number;
}

/** API Spec §4.3 POST /api/v1/stock-transfers */
export class CreateStockTransferDto {
  @IsUUID()
  fromLocationId!: string;

  @IsUUID()
  toLocationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockTransferLineDto)
  lines!: StockTransferLineDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStockTransferDto {
  @IsOptional()
  @IsEnum(StockTransferStatus)
  status?: StockTransferStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StockTransferLineResponseDto {
  id!: string;
  stockItemId!: string;
  quantity!: string;
}

export class StockTransferResponseDto {
  id!: string;
  tenantId!: string;
  fromLocationId!: string;
  toLocationId!: string;
  status!: StockTransferStatus;
  notes!: string | null;
  lines!: StockTransferLineResponseDto[];
  createdAt!: Date;
  updatedAt!: Date | null;
}
