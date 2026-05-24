import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionConditionEntity } from '../entities';

@Injectable()
export class PromotionConditionRepository {
  constructor(
    @InjectRepository(PromotionConditionEntity)
    private readonly repository: Repository<PromotionConditionEntity>,
  ) {}

  // TODO: findAllByPromotionId, findById, create, update, remove
}
