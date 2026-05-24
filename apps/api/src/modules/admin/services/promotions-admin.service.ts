import { Injectable } from '@nestjs/common';
import { PromotionStatus } from '../../promotions/enums/promotion-status.enum';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import {
  AdminPromotionRepository,
  AdminPromotionListFilter,
} from '../repositories/admin-promotion.repository';
import { AdminCreatePromotionDto } from '../dto/admin-create-promotion.dto';
import { AdminUpdatePromotionDto } from '../dto/admin-update-promotion.dto';

@Injectable()
export class PromotionsAdminService {
  constructor(private readonly promotionRepository: AdminPromotionRepository) {}

  listPromotions(tenantId: string, filter: AdminPromotionListFilter) {
    return this.promotionRepository.findAllForTenant(tenantId, filter);
  }

  async createPromotion(tenantId: string, dto: AdminCreatePromotionDto) {
    const promotion = this.promotionRepository.create({
      tenantId,
      name: dto.name,
      type: dto.type,
      value: dto.value,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      code: dto.code ?? null,
      usageLimit: dto.usageLimit ?? null,
      isActive: dto.isActive ?? true,
      status: PromotionStatus.ACTIVE,
      usageCount: 0,
      metadata: {},
    });
    return this.promotionRepository.save(promotion);
  }

  async updatePromotion(tenantId: string, id: string, dto: AdminUpdatePromotionDto) {
    const promotion = await this.requirePromotion(tenantId, id);

    if (dto.name !== undefined) promotion.name = dto.name;
    if (dto.value !== undefined) promotion.value = dto.value;
    if (dto.startDate !== undefined) {
      promotion.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      promotion.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.code !== undefined) promotion.code = dto.code;
    if (dto.usageLimit !== undefined) promotion.usageLimit = dto.usageLimit;

    return this.promotionRepository.save(promotion);
  }

  async activatePromotion(tenantId: string, id: string) {
    const promotion = await this.requirePromotion(tenantId, id);
    promotion.isActive = true;
    promotion.status = PromotionStatus.ACTIVE;
    return this.promotionRepository.save(promotion);
  }

  async deactivatePromotion(tenantId: string, id: string) {
    const promotion = await this.requirePromotion(tenantId, id);
    promotion.isActive = false;
    promotion.status = PromotionStatus.DEACTIVATED;
    return this.promotionRepository.save(promotion);
  }

  viewPromotionUsage(tenantId: string, promotionId: string) {
    return this.promotionRepository.getUsageSummary(tenantId, promotionId);
  }

  private async requirePromotion(tenantId: string, id: string) {
    const promotion = await this.promotionRepository.findByIdForTenant(tenantId, id);
    if (!promotion) {
      throwAdminResourceNotFound('promotion', id);
    }
    return promotion;
  }
}
