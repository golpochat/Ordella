import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateStockReservationDto,
  StockReservationResponseDto,
} from '../dto/stock-reservations/stock-reservation.dto';

@Injectable()
export class StockReservationsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<StockReservationResponseDto[]> {
    throw new NotImplementedException('findAll stock-reservations');
  }

  create(_tenant: TenantContext, _dto: CreateStockReservationDto): Promise<StockReservationResponseDto> {
    throw new NotImplementedException('create stock-reservation');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<StockReservationResponseDto> {
    throw new NotImplementedException('findOne stock-reservation');
  }

  release(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('release stock-reservation');
  }
}
