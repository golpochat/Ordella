import { Injectable } from '@nestjs/common';
import { KdsWsEvent } from '../enums/kds-ws-event.enum';
import { KdsGateway } from '../gateways/kds.gateway';
import { KdsOrderDetailView, KdsOrderSummaryView } from '../types/kds-order.views';

@Injectable()
export class KdsBroadcastService {
  constructor(private readonly gateway: KdsGateway) {}

  orderCreated(tenantId: string, order: KdsOrderSummaryView, station?: string): void {
    this.gateway.broadcastToTenant(tenantId, KdsWsEvent.ORDER_CREATED, order, station);
  }

  orderUpdated(tenantId: string, order: KdsOrderDetailView, station?: string): void {
    this.gateway.broadcastToTenant(tenantId, KdsWsEvent.ORDER_UPDATED, order, station);
  }

  orderPreparing(tenantId: string, order: KdsOrderDetailView, station?: string): void {
    this.gateway.broadcastToTenant(tenantId, KdsWsEvent.ORDER_PREPARING, order, station);
  }

  orderReady(tenantId: string, order: KdsOrderDetailView, station?: string): void {
    this.gateway.broadcastToTenant(tenantId, KdsWsEvent.ORDER_READY, order, station);
  }

  orderCompleted(tenantId: string, order: KdsOrderDetailView, station?: string): void {
    this.gateway.broadcastToTenant(tenantId, KdsWsEvent.ORDER_COMPLETED, order, station);
  }
}
