import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockReservationEntity } from '../entities/stock-reservation.entity';

@Injectable()
export class StockReservationRepository {
  constructor(
    @InjectRepository(StockReservationEntity)
    private readonly repository: Repository<StockReservationEntity>,
  ) {}
}
