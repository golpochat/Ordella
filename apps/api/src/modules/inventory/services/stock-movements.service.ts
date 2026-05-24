import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateStockMovementDto } from '../dto/stock-movements/create-stock-movement.dto';
import { StockMovementResponseDto } from '../dto/stock-movements/stock-movement-response.dto';

@Injectable()
export class StockMovementsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<StockMovementResponseDto[]> {
    throw new NotImplementedException('findAll stock-movements');
  }

  create(_tenant: TenantContext, _dto: CreateStockMovementDto): Promise<StockMovementResponseDto> {
    throw new NotImplementedException('create stock-movement');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockMovementResponseDto> {
    throw new NotImplementedException('findOne stock-movement');
  }
}
