import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { KDS_DEFAULT_ACTIVE_STATUSES } from '../repositories/kds-order-query.repository';
import { KdsOrderQueryService } from './kds-order-query.service';
import { KdsOrderSummaryView } from '../types/kds-order.views';

@Injectable()
export class FulfillmentFeedService {
  constructor(private readonly orderQueryService: KdsOrderQueryService) {}

  getFeed(
    tenantId: string,
    locationId: string,
    includeCompleted = false,
  ): Promise<KdsOrderSummaryView[]> {
    const statuses = includeCompleted
      ? [...KDS_DEFAULT_ACTIVE_STATUSES, OrderStatus.COMPLETED]
      : [...KDS_DEFAULT_ACTIVE_STATUSES];
    return this.orderQueryService.getActiveOrdersByStatuses(
      tenantId,
      locationId,
      statuses,
    );
  }
}
