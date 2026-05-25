import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StockTransferStatus } from '../../enums/stock-transfer-status.enum';
import { ReceiveStockTransferLineDto } from './receive-stock-transfer.dto';

export class UpdateStockTransferDto {
  @IsOptional()
  @IsEnum(StockTransferStatus)
  status?: StockTransferStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  lines?: ReceiveStockTransferLineDto[];
}
