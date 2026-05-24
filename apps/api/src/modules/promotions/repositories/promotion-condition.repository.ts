import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromotionConditionEntity } from '../entities';

@Injectable()
export class PromotionConditionRepository {
  constructor(
    @InjectRepository(PromotionConditionEntity)
    private readonly repository: Repository<PromotionConditionEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PromotionConditionEntity> {
    return manager ? manager.getRepository(PromotionConditionEntity) : this.repository;
  }

  findByPromotionId(
    promotionId: string,
    manager?: EntityManager,
  ): Promise<PromotionConditionEntity[]> {
    return this.repo(manager).find({ where: { promotionId } });
  }
}
