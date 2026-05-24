import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryPerformanceSummaryEntity } from '../entities/delivery-performance-summary.entity';
import { ReportDateRange } from '../types/report-ingest-event.input';

@Injectable()
export class DeliveryPerformanceSummaryRepository {
  constructor(
    @InjectRepository(DeliveryPerformanceSummaryEntity)
    private readonly repository: Repository<DeliveryPerformanceSummaryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DeliveryPerformanceSummaryEntity> {
    return manager
      ? manager.getRepository(DeliveryPerformanceSummaryEntity)
      : this.repository;
  }

  async findOrCreateForDate(
    tenantId: string,
    summaryDate: string,
    manager?: EntityManager,
  ): Promise<DeliveryPerformanceSummaryEntity> {
    const existing = await this.repo(manager).findOne({ where: { tenantId, summaryDate } });
    if (existing) {
      return existing;
    }

    const row = this.repo(manager).create({
      tenantId,
      summaryDate,
      completed: 0,
      failed: 0,
      avgDeliveryTime: '0.00',
    });
    return this.repo(manager).save(row);
  }

  save(
    row: DeliveryPerformanceSummaryEntity,
    manager?: EntityManager,
  ): Promise<DeliveryPerformanceSummaryEntity> {
    return this.repo(manager).save(row);
  }

  findForTenantInRange(
    tenantId: string,
    range: ReportDateRange,
  ): Promise<DeliveryPerformanceSummaryEntity[]> {
    const qb = this.repository
      .createQueryBuilder('summary')
      .where('summary.tenantId = :tenantId', { tenantId })
      .orderBy('summary.summaryDate', 'ASC');

    if (range.from) {
      qb.andWhere('summary.summaryDate >= :from', { from: range.from });
    }
    if (range.to) {
      qb.andWhere('summary.summaryDate <= :to', { to: range.to });
    }

    return qb.getMany();
  }
}
