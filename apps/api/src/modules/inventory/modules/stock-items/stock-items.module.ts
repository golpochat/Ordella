import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItemEntity } from '../../entities';
import { StockItemsController } from '../../controllers';
import { StockItemsService } from '../../services';
import { StockItemRepository } from '../../repositories/stock-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockItemEntity])],
  controllers: [StockItemsController],
  providers: [StockItemsService, StockItemRepository],
  exports: [],
})
export class StockItemsModule {}
