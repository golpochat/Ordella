import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionApplicationEntity } from '../entities/promotion-application.entity';

@Injectable()
export class PromotionApplicationRepository {
  constructor(
    @InjectRepository(PromotionApplicationEntity)
    private readonly repository: Repository<PromotionApplicationEntity>,
  ) {}

  // TODO: findAllForTenant with filters, findById, create
}
