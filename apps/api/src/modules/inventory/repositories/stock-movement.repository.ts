import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StockMovementEntity } from '../entities';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { StockMovementSource } from '../enums/stock-movement-source.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';

export interface AppendMovementParams {
  tenantId: string;
  stockItemId: string;
  type: StockMovementType;
  quantity: string;
  source: StockMovementSource;
  referenceType?: StockReferenceType | null;
  referenceId?: string | null;
  notes?: string | null;
}

@Injectable()
export class StockMovementRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repository: Repository<StockMovementEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<StockMovementEntity> {
    return manager ? manager.getRepository(StockMovementEntity) : this.repository;
  }

  append(params: AppendMovementParams, manager?: EntityManager): Promise<StockMovementEntity> {
    const entry = this.repo(manager).create({
      tenantId: params.tenantId,
      stockItemId: params.stockItemId,
      type: params.type,
      quantity: params.quantity,
      source: params.source,
      referenceType: params.referenceType ?? null,
      referenceId: params.referenceId ?? null,
      notes: params.notes ?? null,
    });
    return this.repo(manager).save(entry);
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<StockMovementEntity | null> {
    return this.repo(manager).findOne({ where: { id, tenantId } });
  }
}
