import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateStockReservationDto } from '../dto/stock-reservations/create-stock-reservation.dto';
import { StockReservationResponseDto } from '../dto/stock-reservations/stock-reservation-response.dto';

@Injectable()
export class StockReservationsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<StockReservationResponseDto[]> {
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
