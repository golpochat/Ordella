import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities/order.entity';
import { OrderStatusHistoryEntity } from '../../entities/order-status-history.entity';
import { OrderEventEntity } from '../../entities/order-event.entity';
import { OrdersController } from '../../controllers/orders.controller';
import { OrdersService } from '../../services/orders.service';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderStatusHistoryRepository } from '../../repositories/order-status-history.repository';
import { OrderEventRepository } from '../../repositories/order-event.repository';
import { OrderStatusHistoryService } from '../../services/order-status-history.service';
import { OrderEventsService } from '../../services/order-events.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderStatusHistoryEntity, OrderEventEntity])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    OrderStatusHistoryRepository,
    OrderEventRepository,
    OrderStatusHistoryService,
    OrderEventsService,
  ],
  exports: [OrdersService, OrderRepository, OrderStatusHistoryService, OrderEventsService],
})
export class OrdersFeatureModule {}
