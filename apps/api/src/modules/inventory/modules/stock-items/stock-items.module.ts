import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItemEntity } from '../../entities/stock-item.entity';
import { StockItemsController } from '../../controllers/stock-items.controller';
import { StockItemsService } from '../../services/stock-items.service';
import { StockItemRepository } from '../../repositories/stock-item.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockItemEntity])],
  controllers: [StockItemsController],
  providers: [StockItemsService, StockItemRepository],
  exports: [],
})
export class StockItemsModule {}
