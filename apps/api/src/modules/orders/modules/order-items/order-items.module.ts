import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities/order-item.entity';
import { OrderItemsController } from '../../controllers/order-items.controller';
import { OrderItemsService } from '../../services/order-items.service';
import { OrderItemRepository } from '../../repositories/order-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemEntity])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService, OrderItemRepository],
  exports: [OrderItemsService, OrderItemRepository],
})
export class OrderItemsModule {}
