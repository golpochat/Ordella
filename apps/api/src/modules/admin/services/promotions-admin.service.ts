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
      description: dto.description ?? null,
      type: dto.type,
      value: dto.value,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      code: dto.code ?? null,
      buyQuantity: dto.buyQuantity ?? null,
      getQuantity: dto.getQuantity ?? null,
      minSpend: dto.minSpend ?? null,
      applicableLocations: dto.applicableLocations ?? [],
      applicableCategories: dto.applicableCategories ?? [],
      applicableItems: dto.applicableItems ?? [],
      autoApply: dto.autoApply ?? dto.type !== 'coupon',
      channel: dto.channel ?? 'both',
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
    if (dto.description !== undefined) promotion.description = dto.description || null;
    if (dto.type !== undefined) promotion.type = dto.type;
    if (dto.value !== undefined) promotion.value = dto.value;
    if (dto.startDate !== undefined) {
      promotion.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      promotion.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.code !== undefined) promotion.code = dto.code;
    if (dto.buyQuantity !== undefined) promotion.buyQuantity = dto.buyQuantity;
    if (dto.getQuantity !== undefined) promotion.getQuantity = dto.getQuantity;
    if (dto.minSpend !== undefined) promotion.minSpend = dto.minSpend || null;
    if (dto.applicableLocations !== undefined) promotion.applicableLocations = dto.applicableLocations;
    if (dto.applicableCategories !== undefined) promotion.applicableCategories = dto.applicableCategories;
    if (dto.applicableItems !== undefined) promotion.applicableItems = dto.applicableItems;
    if (dto.autoApply !== undefined) promotion.autoApply = dto.autoApply;
    if (dto.channel !== undefined) promotion.channel = dto.channel;
    if (dto.isActive !== undefined) {
      promotion.isActive = dto.isActive;
      promotion.status = dto.isActive ? PromotionStatus.ACTIVE : PromotionStatus.DEACTIVATED;
    }
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

  async duplicatePromotion(tenantId: string, id: string) {
    const promotion = await this.requirePromotion(tenantId, id);
    const copy = this.promotionRepository.create({
      tenantId,
      name: `${promotion.name} copy`,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      code: null,
      buyQuantity: promotion.buyQuantity,
      getQuantity: promotion.getQuantity,
      minSpend: promotion.minSpend,
      applicableLocations: promotion.applicableLocations ?? [],
      applicableCategories: promotion.applicableCategories ?? [],
      applicableItems: promotion.applicableItems ?? [],
      autoApply: promotion.autoApply,
      channel: promotion.channel,
      usageLimit: promotion.usageLimit,
      isActive: false,
      status: PromotionStatus.DEACTIVATED,
      usageCount: 0,
      metadata: promotion.metadata ?? {},
    });
    return this.promotionRepository.save(copy);
  }

  viewPromotionUsage(tenantId: string, promotionId: string) {
    return this.promotionRepository.getUsageSummary(tenantId, promotionId);
  }

  analytics(tenantId: string) {
    return this.promotionRepository.getAnalytics(tenantId);
  }

  private async requirePromotion(tenantId: string, id: string) {
    const promotion = await this.promotionRepository.findByIdForTenant(tenantId, id);
    if (!promotion) {
      throwAdminResourceNotFound('promotion', id);
    }
    return promotion;
  }
}
