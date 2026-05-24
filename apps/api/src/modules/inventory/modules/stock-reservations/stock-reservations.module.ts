import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockReservationEntity } from '../../entities';
import { StockReservationsController } from '../../controllers';
import { StockReservationsService } from '../../services';
import { StockReservationRepository } from '../../repositories/stock-reservation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockReservationEntity])],
  controllers: [StockReservationsController],
  providers: [StockReservationsService, StockReservationRepository],
  exports: [],
})
export class StockReservationsModule {}
