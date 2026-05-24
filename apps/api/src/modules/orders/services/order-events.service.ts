import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto';
import { OrderEventResponseDto } from '../dto';

@Injectable()
export class OrderEventsService {
  findByOrderId(
    _tenant: TenantContext,
    _orderId: string,
    _query: FilterPaginationDto,
  ): Promise<OrderEventResponseDto[]> {
    throw new NotImplementedException('find order events');
  }

  // TODO: recordEvent — publish to event bus + persist
}
