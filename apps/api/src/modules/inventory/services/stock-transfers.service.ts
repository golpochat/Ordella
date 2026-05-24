import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateStockTransferDto,
  StockTransferResponseDto,
  UpdateStockTransferDto,
} from '../dto/stock-transfers/stock-transfer.dto';

@Injectable()
export class StockTransfersService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<StockTransferResponseDto[]> {
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
