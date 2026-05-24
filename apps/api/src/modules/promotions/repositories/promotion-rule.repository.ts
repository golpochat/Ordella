import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionRuleEntity } from '../entities/promotion-rule.entity';

@Injectable()
export class PromotionRuleRepository {
  constructor(
    @InjectRepository(PromotionRuleEntity)
    private readonly repository: Repository<PromotionRuleEntity>,
  ) {}

  // TODO: findAllByPromotionId, findById, create, update, remove
}
