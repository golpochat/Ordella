import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationChannelEntity } from '../entities';

@Injectable()
export class NotificationChannelRepository {
  constructor(
    @InjectRepository(NotificationChannelEntity)
    private readonly repository: Repository<NotificationChannelEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update, remove
}
