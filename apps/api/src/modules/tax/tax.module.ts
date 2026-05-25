import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LocationEntity } from '../tenants/entities';
import { TaxController } from './controllers';
import { TAX_ENTITIES } from './entities';
import {
  TaxCalculationService,
  TaxCategoriesService,
  TaxReportService,
  TaxRulesService,
} from './services';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([...TAX_ENTITIES, LocationEntity])],
  controllers: [TaxController],
  providers: [TaxCalculationService, TaxCategoriesService, TaxReportService, TaxRulesService],
  exports: [TaxCalculationService, TypeOrmModule],
})
export class TaxModule {}
