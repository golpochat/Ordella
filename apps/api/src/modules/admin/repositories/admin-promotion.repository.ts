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

  async getAnalytics(tenantId: string): Promise<{
    usageCount: number;
    discountCost: string;
    revenueInfluenced: string;
    conversionRateUplift: number;
    topPromotions: Array<{ promotionId: string; usageCount: number; discountCost: string }>;
  }> {
    const rows = await this.applicationRepository.find({ where: { tenantId } });
    const byPromotion = new Map<string, { usageCount: number; discountCost: number }>();
    let discountCost = 0;
    for (const row of rows) {
      const amount = parseFloat(row.discountAmount);
      discountCost += amount;
      const current = byPromotion.get(row.promotionId) ?? { usageCount: 0, discountCost: 0 };
      current.usageCount += 1;
      current.discountCost += amount;
      byPromotion.set(row.promotionId, current);
    }
    return {
      usageCount: rows.length,
      discountCost: discountCost.toFixed(2),
      revenueInfluenced: '0.00',
      conversionRateUplift: 0,
      topPromotions: [...byPromotion.entries()]
        .map(([promotionId, value]) => ({
          promotionId,
          usageCount: value.usageCount,
          discountCost: value.discountCost.toFixed(2),
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10),
    };
  }
}
