import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionApplicationEntity } from '../../entities';
import { PromotionApplicationsController } from '../../controllers';
import { PromotionApplicationsService } from '../../services';
import { PromotionApplicationRepository } from '../../repositories/promotion-application.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionApplicationEntity])],
  controllers: [PromotionApplicationsController],
  providers: [PromotionApplicationsService, PromotionApplicationRepository],
  exports: [],
})
export class PromotionApplicationsModule {}
