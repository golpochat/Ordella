import { Injectable } from '@nestjs/common';
import { KdsOrderQueryService } from '../../kds/services/kds-order-query.service';
import { KdsBroadcastService } from '../../kds/services/kds-broadcast.service';

@Injectable()
export class PosFulfillmentService {
  constructor(
    private readonly kdsOrderQuery: KdsOrderQueryService,
    private readonly kdsBroadcast: KdsBroadcastService,
  ) {}

  async routeOrderToFulfillment(tenantId: string, orderId: string): Promise<void> {
    const detail = await this.kdsOrderQuery.getOrderDetails(tenantId, orderId);
    this.kdsBroadcast.orderCreated(tenantId, detail);
  }
}
