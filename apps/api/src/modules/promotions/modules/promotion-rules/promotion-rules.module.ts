import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionRuleEntity } from '../../entities/promotion-rule.entity';
import { PromotionRulesController } from '../../controllers/promotion-rules.controller';
import { PromotionRulesService } from '../../services/promotion-rules.service';
import { PromotionRuleRepository } from '../../repositories/promotion-rule.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionRuleEntity])],
  controllers: [PromotionRulesController],
  providers: [PromotionRulesService, PromotionRuleRepository],
  exports: [PromotionRulesService, PromotionRuleRepository],
})
export class PromotionRulesModule {}
