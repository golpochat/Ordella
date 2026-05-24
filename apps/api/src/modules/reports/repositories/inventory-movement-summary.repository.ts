import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryMovementSummaryEntity } from '../entities/inventory-movement-summary.entity';
import { ReportDateRange } from '../types/report-ingest-event.input';

@Injectable()
export class InventoryMovementSummaryRepository {
  constructor(
    @InjectRepository(InventoryMovementSummaryEntity)
    private readonly repository: Repository<InventoryMovementSummaryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<InventoryMovementSummaryEntity> {
    return manager ? manager.getRepository(InventoryMovementSummaryEntity) : this.repository;
  }

  async findOrCreateForDateProduct(
    tenantId: string,
    summaryDate: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<InventoryMovementSummaryEntity> {
    const existing = await this.repo(manager).findOne({
      where: { tenantId, summaryDate, productId },
    });
    if (existing) {
      return existing;
    }

    const row = this.repo(manager).create({
      tenantId,
      summaryDate,
      productId,
      quantityIn: '0.0000',
      quantityOut: '0.0000',
    });
    return this.repo(manager).save(row);
  }

  save(
    row: InventoryMovementSummaryEntity,
    manager?: EntityManager,
  ): Promise<InventoryMovementSummaryEntity> {
    return this.repo(manager).save(row);
  }

  findForTenantInRange(
    tenantId: string,
    range: ReportDateRange,
  ): Promise<InventoryMovementSummaryEntity[]> {
    const qb = this.repository
      .createQueryBuilder('summary')
      .where('summary.tenantId = :tenantId', { tenantId })
      .orderBy('summary.summaryDate', 'ASC')
      .addOrderBy('summary.productId', 'ASC');

    if (range.from) {
      qb.andWhere('summary.summaryDate >= :from', { from: range.from });
    }
    if (range.to) {
      qb.andWhere('summary.summaryDate <= :to', { to: range.to });
    }

    return qb.getMany();
  }
}
