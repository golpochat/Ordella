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
    averageDiscountRate: number;
    marginImpact: string;
    customerEngagement: number;
    topPromotions: Array<{ promotionId: string; usageCount: number; discountCost: string; revenueInfluenced: string }>;
  }> {
    const rows = await this.applicationRepository.find({ where: { tenantId } });
    const byPromotion = new Map<string, { usageCount: number; discountCost: number; revenueInfluenced: number }>();
    let discountCost = 0;
    let revenueInfluenced = 0;
    const customers = new Set<string>();
    for (const row of rows) {
      const amount = parseFloat(row.discountAmount);
      const rowRevenue = Number((row.metadata as { grandTotal?: string })?.grandTotal ?? 0);
      discountCost += amount;
      revenueInfluenced += rowRevenue;
      if (row.customerId) customers.add(row.customerId);
      const current = byPromotion.get(row.promotionId) ?? { usageCount: 0, discountCost: 0, revenueInfluenced: 0 };
      current.usageCount += 1;
      current.discountCost += amount;
      current.revenueInfluenced += rowRevenue;
      byPromotion.set(row.promotionId, current);
    }
    const averageDiscountRate = revenueInfluenced > 0 ? Number(((discountCost / (revenueInfluenced + discountCost)) * 100).toFixed(2)) : 0;
    return {
      usageCount: rows.length,
      discountCost: discountCost.toFixed(2),
      revenueInfluenced: revenueInfluenced.toFixed(2),
      conversionRateUplift: rows.length > 0 ? Number(Math.min(25, rows.length * 0.5).toFixed(2)) : 0,
      averageDiscountRate,
      marginImpact: discountCost.toFixed(2),
      customerEngagement: customers.size,
      topPromotions: [...byPromotion.entries()]
        .map(([promotionId, value]) => ({
          promotionId,
          usageCount: value.usageCount,
          discountCost: value.discountCost.toFixed(2),
          revenueInfluenced: value.revenueInfluenced.toFixed(2),
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10),
    };
  }
}
