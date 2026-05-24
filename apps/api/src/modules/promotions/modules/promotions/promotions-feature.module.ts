import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from '../../entities/promotion.entity';
import { PromotionsController } from '../../controllers/promotions.controller';
import { PromotionsService } from '../../services/promotions.service';
import { PromotionRepository } from '../../repositories/promotion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity])],
  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionRepository],
  exports: [],
})
export class PromotionsFeatureModule {}
