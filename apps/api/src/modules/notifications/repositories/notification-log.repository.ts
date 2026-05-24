import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogEntity } from '../entities';

@Injectable()
export class NotificationLogRepository {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly repository: Repository<NotificationLogEntity>,
  ) {}

  // TODO: findAllForTenant with filters
}
