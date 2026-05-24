import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateStockItemDto } from '../dto';
import { UpdateStockItemDto } from '../dto';
import { StockItemResponseDto } from '../dto';

@Injectable()
export class StockItemsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StockItemResponseDto[]> {
    throw new NotImplementedException('findAll stock-items');
  }

  create(_tenant: TenantContext, _dto: CreateStockItemDto): Promise<StockItemResponseDto> {
    throw new NotImplementedException('create stock-item');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockItemResponseDto> {
    throw new NotImplementedException('findOne stock-item');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateStockItemDto): Promise<StockItemResponseDto> {
    throw new NotImplementedException('update stock-item');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove stock-item');
  }
}
