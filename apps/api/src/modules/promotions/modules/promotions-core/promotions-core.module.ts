import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PromotionActionEntity,
  PromotionApplicationEntity,
  PromotionConditionEntity,
  PromotionEntity,
  PromotionRuleEntity,
} from '../../entities';
import { PromotionsService } from '../../services/promotions.service';
import { PromotionRepository } from '../../repositories/promotion.repository';
import { PromotionConditionRepository } from '../../repositories/promotion-condition.repository';
import { PromotionActionRepository } from '../../repositories/promotion-action.repository';
import { PromotionApplicationRepository } from '../../repositories/promotion-application.repository';
import {
  CustomerSegmentationService,
  ExternalPromoProviderService,
  LoyaltyPointsService,
} from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionEntity,
      PromotionConditionEntity,
      PromotionActionEntity,
      PromotionApplicationEntity,
      PromotionRuleEntity,
    ]),
  ],
  providers: [
    PromotionsService,
    PromotionRepository,
    PromotionConditionRepository,
    PromotionActionRepository,
    PromotionApplicationRepository,
    CustomerSegmentationService,
    LoyaltyPointsService,
    ExternalPromoProviderService,
  ],
  exports: [PromotionsService],
})
export class PromotionsCoreModule {}
