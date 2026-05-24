import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PROMOTIONS_ENTITIES } from './entities';
import { PromotionsFeatureModule } from './modules/promotions/promotions-feature.module';
import { PromotionRulesModule } from './modules/promotion-rules/promotion-rules.module';
import { PromotionConditionsModule } from './modules/promotion-conditions/promotion-conditions.module';
import { PromotionApplicationsModule } from './modules/promotion-applications/promotion-applications.module';

/**
 * Promotions domain — SRS §12 / §47, API Spec §9 (blueprint Promotion Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /promotions
 * - /promotion-rules, /promotion-conditions, /promotion-applications
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(PROMOTIONS_ENTITIES),
    PromotionsFeatureModule,
    PromotionRulesModule,
    PromotionConditionsModule,
    PromotionApplicationsModule,
  ],
  exports: [
    PromotionsFeatureModule,
    PromotionRulesModule,
    PromotionConditionsModule,
    PromotionApplicationsModule,
    TypeOrmModule,
  ],
})
export class PromotionsModule {}
