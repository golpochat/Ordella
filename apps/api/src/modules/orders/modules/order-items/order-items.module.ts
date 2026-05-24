import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities';
import { OrderItemsController } from '../../controllers';
import { OrderItemsService } from '../../services';
import { OrderItemRepository } from '../../repositories/order-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService, OrderItemRepository],
  exports: [],
})
export class OrderItemsModule {}
