import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateStockMovementDto } from '../dto';
import { StockMovementResponseDto } from '../dto';

@Injectable()
export class StockMovementsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StockMovementResponseDto[]> {
    throw new NotImplementedException('findAll stock-movements');
  }

  create(_tenant: TenantContext, _dto: CreateStockMovementDto): Promise<StockMovementResponseDto> {
    throw new NotImplementedException('create stock-movement');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockMovementResponseDto> {
    throw new NotImplementedException('findOne stock-movement');
  }
}
