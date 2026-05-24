import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionRuleEntity } from '../../entities';
import { PromotionRulesController } from '../../controllers';
import { PromotionRulesService } from '../../services';
import { PromotionRuleRepository } from '../../repositories/promotion-rule.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionRuleEntity])],
  controllers: [PromotionRulesController],
  providers: [PromotionRulesService, PromotionRuleRepository],
  exports: [],
})
export class PromotionRulesModule {}
