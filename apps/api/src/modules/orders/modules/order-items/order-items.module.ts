import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { VariantEntity } from '../../../catalog/entities/variant.entity';
import { OrderEntity } from '../../entities';
import { OrderItemEntity } from '../../entities';
import { OrderItemsController } from '../../controllers';
import { OrderItemsService } from '../../services';
import { OrderItemRepository } from '../../repositories/order-item.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderPricingService } from '../../services/order-pricing.service';
import { OrderTotalsService } from '../../services/order-totals.service';
import { PromotionsService } from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderItemEntity,
      OrderEntity,
      ProductEntity,
      VariantEntity,
    ]),
  ],
  controllers: [OrderItemsController],
  providers: [
    OrderItemsService,
    OrderItemRepository,
    OrderRepository,
    OrderPricingService,
    OrderTotalsService,
    PromotionsService,
  ],
  exports: [],
})
export class OrderItemsModule {}
