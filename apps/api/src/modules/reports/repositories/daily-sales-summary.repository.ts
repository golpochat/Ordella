import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DailySalesSummaryEntity } from '../entities/daily-sales-summary.entity';
import { ReportDateRange } from '../types/report-ingest-event.input';

@Injectable()
export class DailySalesSummaryRepository {
  constructor(
    @InjectRepository(DailySalesSummaryEntity)
    private readonly repository: Repository<DailySalesSummaryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DailySalesSummaryEntity> {
    return manager ? manager.getRepository(DailySalesSummaryEntity) : this.repository;
  }

  async findOrCreateForDate(
    tenantId: string,
    summaryDate: string,
    manager?: EntityManager,
  ): Promise<DailySalesSummaryEntity> {
    const existing = await this.repo(manager).findOne({ where: { tenantId, summaryDate } });
    if (existing) {
      return existing;
    }

    const row = this.repo(manager).create({
      tenantId,
      summaryDate,
      totalOrders: 0,
      totalRevenue: '0.00',
      totalDiscounts: '0.00',
      totalRefunds: '0.00',
    });
    return this.repo(manager).save(row);
  }

  save(row: DailySalesSummaryEntity, manager?: EntityManager): Promise<DailySalesSummaryEntity> {
    return this.repo(manager).save(row);
  }

  findForTenantInRange(
    tenantId: string,
    range: ReportDateRange,
  ): Promise<DailySalesSummaryEntity[]> {
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
