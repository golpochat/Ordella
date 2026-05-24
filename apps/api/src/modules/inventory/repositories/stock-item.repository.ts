import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItemEntity } from '../entities';

@Injectable()
export class StockItemRepository {
  constructor(
    @InjectRepository(StockItemEntity)
    private readonly repository: Repository<StockItemEntity>,
  ) {}

  // TODO: tenant-scoped CRUD
}
