import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { OrderStatusHistoryResponseDto } from '../dto/order-status-history/order-status-history-response.dto';

@Injectable()
export class OrderStatusHistoryService {
  findByOrderId(
    _tenant: TenantContext,
    _orderId: string,
    _query: PaginationQueryDto,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    throw new NotImplementedException('find order status history');
  }

  // TODO: recordTransition — called when order status changes
}
