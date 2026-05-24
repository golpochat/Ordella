import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ReportEventEntity } from '../entities/report-event.entity';
import { ReportEventType } from '../enums/report-event-type.enum';

@Injectable()
export class ReportEventRepository {
  constructor(
    @InjectRepository(ReportEventEntity)
    private readonly repository: Repository<ReportEventEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<ReportEventEntity> {
    return manager ? manager.getRepository(ReportEventEntity) : this.repository;
  }

  append(
    tenantId: string,
    eventType: ReportEventType,
    payload: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<ReportEventEntity> {
    const row = this.repo(manager).create({ tenantId, eventType, payload });
    return this.repo(manager).save(row);
  }
}
