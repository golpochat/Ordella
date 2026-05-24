import { StockTransferStatus } from '../../enums/stock-transfer-status.enum';
import { StockTransferLineResponseDto } from './stock-transfer-line-response.dto';

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
