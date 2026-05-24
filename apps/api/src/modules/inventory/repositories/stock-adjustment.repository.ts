import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';

@Injectable()
export class StockAdjustmentRepository {
  constructor(
    @InjectRepository(StockAdjustmentEntity)
    private readonly repository: Repository<StockAdjustmentEntity>,
  ) {}
}
