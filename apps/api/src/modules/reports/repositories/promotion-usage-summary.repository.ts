import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromotionUsageSummaryEntity } from '../entities/promotion-usage-summary.entity';
import { ReportDateRange } from '../types/report-ingest-event.input';

@Injectable()
export class PromotionUsageSummaryRepository {
  constructor(
    @InjectRepository(PromotionUsageSummaryEntity)
    private readonly repository: Repository<PromotionUsageSummaryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PromotionUsageSummaryEntity> {
    return manager ? manager.getRepository(PromotionUsageSummaryEntity) : this.repository;
  }

  async findOrCreateForDatePromotion(
    tenantId: string,
    summaryDate: string,
    promotionId: string,
    manager?: EntityManager,
  ): Promise<PromotionUsageSummaryEntity> {
    const existing = await this.repo(manager).findOne({
      where: { tenantId, summaryDate, promotionId },
    });
    if (existing) {
      return existing;
    }

    const row = this.repo(manager).create({
      tenantId,
      summaryDate,
      promotionId,
      applicationCount: 0,
      totalDiscount: '0.00',
    });
    return this.repo(manager).save(row);
  }

  save(
    row: PromotionUsageSummaryEntity,
    manager?: EntityManager,
  ): Promise<PromotionUsageSummaryEntity> {
    return this.repo(manager).save(row);
  }

  findForTenantInRange(
    tenantId: string,
    range: ReportDateRange,
  ): Promise<PromotionUsageSummaryEntity[]> {
    const qb = this.repository
      .createQueryBuilder('summary')
      .where('summary.tenantId = :tenantId', { tenantId })
      .orderBy('summary.summaryDate', 'ASC')
      .addOrderBy('summary.promotionId', 'ASC');

    if (range.from) {
      qb.andWhere('summary.summaryDate >= :from', { from: range.from });
    }
    if (range.to) {
      qb.andWhere('summary.summaryDate <= :to', { to: range.to });
    }

    return qb.getMany();
  }
}
