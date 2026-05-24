import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockReservationEntity } from '../../entities/stock-reservation.entity';
import { StockReservationsController } from '../../controllers/stock-reservations.controller';
import { StockReservationsService } from '../../services/stock-reservations.service';
import { StockReservationRepository } from '../../repositories/stock-reservation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockReservationEntity])],
  controllers: [StockReservationsController],
  providers: [StockReservationsService, StockReservationRepository],
  exports: [StockReservationsService, StockReservationRepository],
})
export class StockReservationsModule {}
