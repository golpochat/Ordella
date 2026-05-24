import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { OrderEventResponseDto } from '../dto/order-events/order-event-response.dto';

@Injectable()
export class OrderEventsService {
  findByOrderId(
    _tenant: TenantContext,
    _orderId: string,
    _query: PaginationQueryDto,
  ): Promise<OrderEventResponseDto[]> {
    throw new NotImplementedException('find order events');
  }

  // TODO: recordEvent — publish to event bus + persist
}
