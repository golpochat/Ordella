import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementEntity } from '../entities';

@Injectable()
export class StockMovementRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repository: Repository<StockMovementEntity>,
  ) {}

  // TODO: append-only ledger queries
}
