import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from '../../entities/stock-movement.entity';
import { StockMovementsController } from '../../controllers/stock-movements.controller';
import { StockMovementsService } from '../../services/stock-movements.service';
import { StockMovementRepository } from '../../repositories/stock-movement.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovementEntity])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementRepository],
  exports: [StockMovementsService, StockMovementRepository],
})
export class StockMovementsModule {}
