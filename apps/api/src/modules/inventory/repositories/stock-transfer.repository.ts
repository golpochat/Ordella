import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransferEntity } from '../entities';

@Injectable()
export class StockTransferRepository {
  constructor(
    @InjectRepository(StockTransferEntity)
    private readonly repository: Repository<StockTransferEntity>,
  ) {}

  // TODO: load with lines relation
}
