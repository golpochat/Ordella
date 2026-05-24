import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateOrderDto } from '../dto/orders/create-order.dto';
import { UpdateOrderDto } from '../dto/orders/update-order.dto';
import { OrderResponseDto } from '../dto/orders/order-response.dto';
import { OrderStatusHistoryResponseDto } from '../dto/order-status-history/order-status-history-response.dto';
import { OrderEventResponseDto } from '../dto/order-events/order-event-response.dto';

@Injectable()
export class OrdersService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<OrderResponseDto[]> {
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
    _query: PaginationQueryDto,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    throw new NotImplementedException('get order status history');
  }

  getEvents(
    _tenant: TenantContext,
    _orderId: string,
    _query: PaginationQueryDto,
  ): Promise<OrderEventResponseDto[]> {
    throw new NotImplementedException('get order events');
  }
}
