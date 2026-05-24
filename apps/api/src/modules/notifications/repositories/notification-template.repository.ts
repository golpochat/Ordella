import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplateEntity } from '../entities';

@Injectable()
export class NotificationTemplateRepository {
  constructor(
    @InjectRepository(NotificationTemplateEntity)
    private readonly repository: Repository<NotificationTemplateEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update
}
