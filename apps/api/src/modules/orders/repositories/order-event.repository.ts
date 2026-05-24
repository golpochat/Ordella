import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEventEntity } from '../entities';

@Injectable()
export class OrderEventRepository {
  constructor(
    @InjectRepository(OrderEventEntity)
    private readonly repository: Repository<OrderEventEntity>,
  ) {}

  // TODO: findByOrderId, appendEvent
}
