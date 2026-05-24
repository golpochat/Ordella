import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAdjustmentEntity } from '../../entities/stock-adjustment.entity';
import { StockAdjustmentsController } from '../../controllers/stock-adjustments.controller';
import { StockAdjustmentsService } from '../../services/stock-adjustments.service';
import { StockAdjustmentRepository } from '../../repositories/stock-adjustment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockAdjustmentEntity])],
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService, StockAdjustmentRepository],
  exports: [],
})
export class StockAdjustmentsModule {}
