import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StockTransferStatus } from '../../enums/stock-transfer-status.enum';

export class UpdateStockTransferDto {
  @IsOptional()
  @IsEnum(StockTransferStatus)
  status?: StockTransferStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
