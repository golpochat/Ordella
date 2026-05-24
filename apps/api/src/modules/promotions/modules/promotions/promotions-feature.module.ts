import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from '../../entities';
import { PromotionsController } from '../../controllers';
import { PromotionsCrudService } from '../../services/promotions-crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity])],
  controllers: [PromotionsController],
  providers: [PromotionsCrudService],
  exports: [],
})
export class PromotionsFeatureModule {}
