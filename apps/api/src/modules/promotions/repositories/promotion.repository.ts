import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromotionEntity } from '../entities';

@Injectable()
export class PromotionRepository {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly repository: Repository<PromotionEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PromotionEntity> {
    return manager ? manager.getRepository(PromotionEntity) : this.repository;
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<PromotionEntity | null> {
    return this.repo(manager).findOne({ where: { id, tenantId } });
  }

  findByCodeForTenant(
    tenantId: string,
    code: string,
    manager?: EntityManager,
  ): Promise<PromotionEntity | null> {
    return this.repo(manager).findOne({
      where: { tenantId, code },
    });
  }

  findActiveAutomaticForTenant(
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PromotionEntity[]> {
    return this.repo(manager).find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  findByIdWithRulesAndActions(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<PromotionEntity | null> {
    return this.repo(manager).findOne({
      where: { id, tenantId },
      relations: ['conditions', 'actions', 'rules'],
    });
  }

  save(promotion: PromotionEntity, manager?: EntityManager): Promise<PromotionEntity> {
    return this.repo(manager).save(promotion);
  }
}
