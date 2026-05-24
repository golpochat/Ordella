import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionApplicationEntity } from '../../entities/promotion-application.entity';
import { PromotionApplicationsController } from '../../controllers/promotion-applications.controller';
import { PromotionApplicationsService } from '../../services/promotion-applications.service';
import { PromotionApplicationRepository } from '../../repositories/promotion-application.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionApplicationEntity])],
  controllers: [PromotionApplicationsController],
  providers: [PromotionApplicationsService, PromotionApplicationRepository],
  exports: [PromotionApplicationsService, PromotionApplicationRepository],
})
export class PromotionApplicationsModule {}
