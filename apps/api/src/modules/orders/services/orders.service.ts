import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { CreateOrderDto } from '../dto';
import { UpdateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatusHistoryResponseDto } from '../dto';
import { OrderEventResponseDto } from '../dto';

@Injectable()
export class OrdersService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<OrderResponseDto[]> {
    throw new NotImplementedException('findAll orders');
  }

  create(_tenant: TenantContext, _dto: CreateOrderDto): Promise<OrderResponseDto> {
    throw new NotImplementedException('create order');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<OrderResponseDto> {
    throw new NotImplementedException('findOne order');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateOrderDto): Promise<OrderResponseDto> {
    throw new NotImplementedException('update order');
  }

  cancel(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('cancel order');
  }

  getStatusHistory(
    _tenant: TenantContext,
    _orderId: string,
    _query: FilterPaginationDto,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    throw new NotImplementedException('get order status history');
  }

  getEvents(
    _tenant: TenantContext,
    _orderId: string,
    _query: FilterPaginationDto,
  ): Promise<OrderEventResponseDto[]> {
    throw new NotImplementedException('get order events');
  }
}
