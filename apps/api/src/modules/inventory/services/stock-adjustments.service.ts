import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateStockAdjustmentDto } from '../dto/stock-adjustments/create-stock-adjustment.dto';
import { StockAdjustmentResponseDto } from '../dto/stock-adjustments/stock-adjustment-response.dto';

@Injectable()
export class StockAdjustmentsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StockAdjustmentResponseDto[]> {
    throw new NotImplementedException('findAll stock-adjustments');
  }

  create(_tenant: TenantContext, _dto: CreateStockAdjustmentDto): Promise<StockAdjustmentResponseDto> {
    throw new NotImplementedException('create stock-adjustment');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockAdjustmentResponseDto> {
    throw new NotImplementedException('findOne stock-adjustment');
  }
}
