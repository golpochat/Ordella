import { Injectable } from '@nestjs/common';
import { PromotionStatus } from '../../promotions/enums/promotion-status.enum';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import {
  AdminPromotionRepository,
  AdminPromotionListFilter,
} from '../repositories/admin-promotion.repository';
import { AdminCreatePromotionDto } from '../dto/admin-create-promotion.dto';
import { AdminUpdatePromotionDto } from '../dto/admin-update-promotion.dto';
import { PromotionsService as PromotionsCoreService } from '../../promotions/services/promotions.service';
import { PromotionEntity } from '../../promotions/entities/promotion.entity';
import { PromotionType } from '../../promotions/enums/promotion-type.enum';

type PromotionPreviewLine = {
  productId: string;
  categoryId?: string | null;
  quantity?: number;
  lineSubtotal?: string;
  stockLevel?: number | null;
  demandScore?: number | null;
};

type PromotionPreviewInput = {
  promotion: AdminCreatePromotionDto | AdminUpdatePromotionDto;
  subtotal?: string;
  taxTotal?: string;
  deliveryFee?: string;
  serviceChargeTotal?: string;
  locationId?: string | null;
  channel?: 'pos' | 'online' | 'both';
  customerId?: string | null;
  customerSegmentIds?: string[];
  lines?: PromotionPreviewLine[];
};

@Injectable()
export class PromotionsAdminService {
  constructor(
    private readonly promotionRepository: AdminPromotionRepository,
    private readonly promotionsCoreService: PromotionsCoreService,
  ) {}

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
      priority: dto.priority ?? 100,
      stackable: dto.stackable ?? false,
      conflictStrategy: dto.conflictStrategy ?? 'best_price',
      eligibleCustomerSegments: dto.eligibleCustomerSegments ?? [],
      dynamicPricingRules: dto.dynamicPricingRules ?? {},
      isActive: dto.isActive ?? true,
      status: PromotionStatus.ACTIVE,
      usageCount: 0,
      metadata: dto.metadata ?? {},
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
    if (dto.priority !== undefined) promotion.priority = dto.priority;
    if (dto.stackable !== undefined) promotion.stackable = dto.stackable;
    if (dto.conflictStrategy !== undefined) promotion.conflictStrategy = dto.conflictStrategy;
    if (dto.eligibleCustomerSegments !== undefined) promotion.eligibleCustomerSegments = dto.eligibleCustomerSegments;
    if (dto.dynamicPricingRules !== undefined) promotion.dynamicPricingRules = dto.dynamicPricingRules;
    if (dto.metadata !== undefined) promotion.metadata = dto.metadata;

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
      priority: promotion.priority,
      stackable: promotion.stackable,
      conflictStrategy: promotion.conflictStrategy,
      eligibleCustomerSegments: promotion.eligibleCustomerSegments ?? [],
      dynamicPricingRules: promotion.dynamicPricingRules ?? {},
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

  previewPromotionImpact(tenantId: string, dto: PromotionPreviewInput) {
    const source = dto.promotion;
    const lines = (dto.lines ?? []).map((line) => ({
      productId: line.productId,
      categoryId: line.categoryId ?? null,
      quantity: line.quantity ?? 1,
      lineSubtotal: line.lineSubtotal ?? '0.00',
      stockLevel: line.stockLevel ?? null,
      demandScore: line.demandScore ?? null,
    }));
    const subtotal =
      dto.subtotal ??
      lines.reduce((sum, line) => sum + Number(line.lineSubtotal || 0), 0).toFixed(2);
    const promotion = this.promotionRepository.create({
      tenantId,
      name: source.name ?? 'Promotion preview',
      description: source.description ?? null,
      type: source.type ?? PromotionType.PERCENTAGE,
      value: source.value ?? '0',
      startDate: source.startDate ? new Date(source.startDate) : null,
      endDate: source.endDate ? new Date(source.endDate) : null,
      code: source.code ?? null,
      buyQuantity: source.buyQuantity ?? null,
      getQuantity: source.getQuantity ?? null,
      minSpend: source.minSpend ?? null,
      applicableLocations: source.applicableLocations ?? [],
      applicableCategories: source.applicableCategories ?? [],
      applicableItems: source.applicableItems ?? [],
      autoApply: source.autoApply ?? true,
      channel: source.channel ?? dto.channel ?? 'both',
      usageLimit: source.usageLimit ?? null,
      usageCount: 0,
      priority: source.priority ?? 100,
      stackable: source.stackable ?? false,
      conflictStrategy: source.conflictStrategy ?? 'best_price',
      eligibleCustomerSegments: source.eligibleCustomerSegments ?? [],
      dynamicPricingRules: source.dynamicPricingRules ?? {},
      isActive: source.isActive ?? true,
      status: PromotionStatus.ACTIVE,
      metadata: source.metadata ?? {},
    }) as PromotionEntity;
    promotion.id = '00000000-0000-4000-8000-000000000000';

    const result = this.promotionsCoreService.previewPromotion(promotion, {
      tenantId,
      customerId: dto.customerId ?? null,
      locationId: dto.locationId ?? null,
      channel: dto.channel ?? promotion.channel ?? 'both',
      subtotal,
      taxTotal: dto.taxTotal ?? '0.00',
      deliveryFee: dto.deliveryFee ?? '0.00',
      serviceChargeTotal: dto.serviceChargeTotal ?? '0.00',
      customerSegmentIds: dto.customerSegmentIds ?? [],
      lines,
      action: 'apply',
    });
    const subtotalNumber = Number(subtotal || 0);
    const discountNumber = Number(result.discountTotal || 0);
    return {
      ...result,
      projectedSubtotal: subtotal,
      projectedDiscountRate: subtotalNumber > 0 ? Number(((discountNumber / subtotalNumber) * 100).toFixed(2)) : 0,
      estimatedMarginImpact: result.discountTotal,
    };
  }

  private async requirePromotion(tenantId: string, id: string) {
    const promotion = await this.promotionRepository.findByIdForTenant(tenantId, id);
    if (!promotion) {
      throwAdminResourceNotFound('promotion', id);
    }
    return promotion;
  }
}
