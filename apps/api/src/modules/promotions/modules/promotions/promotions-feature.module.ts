import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from '../../entities';
import { PromotionsController } from '../../controllers';
import { PromotionsService } from '../../services';
import { PromotionRepository } from '../../repositories/promotion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity])],
  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionRepository],
  exports: [],
})
export class PromotionsFeatureModule {}
