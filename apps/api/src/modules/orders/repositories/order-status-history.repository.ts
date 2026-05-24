import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusHistoryEntity } from '../entities';

@Injectable()
export class OrderStatusHistoryRepository {
  constructor(
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly repository: Repository<OrderStatusHistoryEntity>,
  ) {}

  // TODO: findByOrderId, appendTransition
}
