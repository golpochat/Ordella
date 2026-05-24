import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromotionApplicationEntity } from '../entities';
import { PromotionApplicationStatus } from '../enums/promotion-application-status.enum';

export interface CreateApplicationParams {
  tenantId: string;
  promotionId: string;
  orderId: string | null;
  customerId: string | null;
  discountAmount: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PromotionApplicationRepository {
  constructor(
    @InjectRepository(PromotionApplicationEntity)
    private readonly repository: Repository<PromotionApplicationEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<PromotionApplicationEntity> {
    return manager ? manager.getRepository(PromotionApplicationEntity) : this.repository;
  }

  create(params: CreateApplicationParams, manager?: EntityManager): Promise<PromotionApplicationEntity> {
    const row = this.repo(manager).create({
      tenantId: params.tenantId,
      promotionId: params.promotionId,
      orderId: params.orderId,
      customerId: params.customerId,
      discountAmount: params.discountAmount,
      status: PromotionApplicationStatus.APPLIED,
      metadata: params.metadata ?? {},
    });
    return this.repo(manager).save(row);
  }

  hasCouponAppliedToOrder(
    tenantId: string,
    orderId: string,
    promotionId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.repo(manager)
      .count({
        where: {
          tenantId,
          orderId,
          promotionId,
          status: PromotionApplicationStatus.APPLIED,
        },
      })
      .then((count) => count > 0);
  }

  countByPromotion(promotionId: string, manager?: EntityManager): Promise<number> {
    return this.repo(manager).count({
      where: { promotionId, status: PromotionApplicationStatus.APPLIED },
    });
  }
}
