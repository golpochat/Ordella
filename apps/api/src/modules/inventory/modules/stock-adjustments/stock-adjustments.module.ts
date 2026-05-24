import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAdjustmentEntity } from '../../entities';
import { StockAdjustmentsController } from '../../controllers';
import { StockAdjustmentsService } from '../../services';
import { StockAdjustmentRepository } from '../../repositories/stock-adjustment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockAdjustmentEntity])],
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService, StockAdjustmentRepository],
  exports: [],
})
export class StockAdjustmentsModule {}
