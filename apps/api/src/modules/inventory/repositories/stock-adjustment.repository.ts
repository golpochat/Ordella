import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StockAdjustmentEntity } from '../entities';
import { StockAdjustmentType } from '../enums/stock-adjustment-type.enum';

export interface AppendAdjustmentParams {
  tenantId: string;
  stockItemId: string;
  locationId: string;
  type: StockAdjustmentType;
  quantityDelta: string;
  reason?: string | null;
  adjustedBy?: string | null;
}

@Injectable()
export class StockAdjustmentRepository {
  constructor(
    @InjectRepository(StockAdjustmentEntity)
    private readonly repository: Repository<StockAdjustmentEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<StockAdjustmentEntity> {
    return manager ? manager.getRepository(StockAdjustmentEntity) : this.repository;
  }

  append(params: AppendAdjustmentParams, manager?: EntityManager): Promise<StockAdjustmentEntity> {
    const entry = this.repo(manager).create({
      tenantId: params.tenantId,
      stockItemId: params.stockItemId,
      locationId: params.locationId,
      type: params.type,
      quantityDelta: params.quantityDelta,
      reason: params.reason ?? null,
      adjustedBy: params.adjustedBy ?? null,
    });
    return this.repo(manager).save(entry);
  }
}
