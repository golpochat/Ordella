import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionEntity } from '../../promotions/entities/promotion.entity';
import { PromotionApplicationEntity } from '../../promotions/entities/promotion-application.entity';

export interface AdminPromotionListFilter {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminPromotionRepository {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(PromotionApplicationEntity)
    private readonly applicationRepository: Repository<PromotionApplicationEntity>,
  ) {}

  findAllForTenant(
    tenantId: string,
    filter: AdminPromotionListFilter,
  ): Promise<PromotionEntity[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;

    return this.promotionRepository.find({
      where: {
        tenantId,
        ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByIdForTenant(tenantId: string, id: string): Promise<PromotionEntity | null> {
    return this.promotionRepository.findOne({ where: { id, tenantId } });
  }

  save(promotion: PromotionEntity): Promise<PromotionEntity> {
    return this.promotionRepository.save(promotion);
  }

  create(partial: Partial<PromotionEntity>): PromotionEntity {
    return this.promotionRepository.create(partial);
  }

  async getUsageSummary(
    tenantId: string,
    promotionId: string,
  ): Promise<{ applicationCount: number; totalDiscount: string }> {
    const rows = await this.applicationRepository.find({
      where: { tenantId, promotionId },
    });
    const totalDiscount = rows.reduce((sum, row) => sum + parseFloat(row.discountAmount), 0);
    return {
      applicationCount: rows.length,
      totalDiscount: totalDiscount.toFixed(2),
    };
  }
}
