import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryStatusHistoryEntity } from '../entities/delivery-status-history.entity';

@Injectable()
export class DeliveryStatusHistoryRepository {
  constructor(
    @InjectRepository(DeliveryStatusHistoryEntity)
    private readonly repository: Repository<DeliveryStatusHistoryEntity>,
  ) {}

  // TODO: findAllByDeliveryTaskId
}
