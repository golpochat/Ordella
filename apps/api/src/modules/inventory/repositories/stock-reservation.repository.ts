import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockReservationEntity } from '../entities';

@Injectable()
export class StockReservationRepository {
  constructor(
    @InjectRepository(StockReservationEntity)
    private readonly repository: Repository<StockReservationEntity>,
  ) {}
}
