import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from '../../entities';
import { StockMovementsController } from '../../controllers';
import { StockMovementsService } from '../../services';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovementEntity])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementRepository],
  exports: [],
})
export class StockMovementsModule {}
