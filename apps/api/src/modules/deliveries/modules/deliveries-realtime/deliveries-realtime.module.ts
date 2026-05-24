import { Module } from '@nestjs/common';
import { DeliveriesGateway } from '../../gateways/deliveries.gateway';
import { DeliveryBroadcastService } from '../../services/delivery-broadcast.service';

@Module({
  providers: [DeliveriesGateway, DeliveryBroadcastService],
  exports: [DeliveriesGateway, DeliveryBroadcastService],
})
export class DeliveriesRealtimeModule {}
