import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateStockTransferDto } from '../dto/stock-transfers/create-stock-transfer.dto';
import { UpdateStockTransferDto } from '../dto/stock-transfers/update-stock-transfer.dto';
import { StockTransferResponseDto } from '../dto/stock-transfers/stock-transfer-response.dto';

@Injectable()
export class StockTransfersService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StockTransferResponseDto[]> {
    throw new NotImplementedException('findAll stock-transfers');
  }

  create(_tenant: TenantContext, _dto: CreateStockTransferDto): Promise<StockTransferResponseDto> {
    throw new NotImplementedException('create stock-transfer');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockTransferResponseDto> {
    throw new NotImplementedException('findOne stock-transfer');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    throw new NotImplementedException('update stock-transfer');
  }
}
