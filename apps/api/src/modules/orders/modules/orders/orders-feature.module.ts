import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities';
import { OrderStatusHistoryEntity } from '../../entities';
import { OrderEventEntity } from '../../entities';
import { OrdersController } from '../../controllers';
import { OrdersService } from '../../services';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderStatusHistoryRepository } from '../../repositories/order-status-history.repository';
import { OrderEventRepository } from '../../repositories/order-event.repository';
import { OrderStatusHistoryService } from '../../services';
import { OrderEventsService } from '../../services';

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
  exports: [],
})
export class OrdersFeatureModule {}
