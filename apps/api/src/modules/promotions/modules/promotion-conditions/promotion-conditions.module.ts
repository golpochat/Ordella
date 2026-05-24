import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionConditionEntity } from '../../entities';
import { PromotionConditionsController } from '../../controllers';
import { PromotionConditionsService } from '../../services';
import { PromotionConditionRepository } from '../../repositories/promotion-condition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionConditionEntity])],
  controllers: [PromotionConditionsController],
  providers: [PromotionConditionsService, PromotionConditionRepository],
  exports: [],
})
export class PromotionConditionsModule {}
