import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionConditionEntity } from '../../entities/promotion-condition.entity';
import { PromotionConditionsController } from '../../controllers/promotion-conditions.controller';
import { PromotionConditionsService } from '../../services/promotion-conditions.service';
import { PromotionConditionRepository } from '../../repositories/promotion-condition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionConditionEntity])],
  controllers: [PromotionConditionsController],
  providers: [PromotionConditionsService, PromotionConditionRepository],
  exports: [],
})
export class PromotionConditionsModule {}
