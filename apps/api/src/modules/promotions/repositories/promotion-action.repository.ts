import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromotionActionEntity } from '../entities/promotion-action.entity';

@Injectable()
export class PromotionActionRepository {
  constructor(
    @InjectRepository(PromotionActionEntity)
    private readonly repository: Repository<PromotionActionEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PromotionActionEntity> {
    return manager ? manager.getRepository(PromotionActionEntity) : this.repository;
  }

  findByPromotionId(
    promotionId: string,
    manager?: EntityManager,
  ): Promise<PromotionActionEntity[]> {
    return this.repo(manager).find({ where: { promotionId } });
  }
}
