import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '../../entities';
import { ReportsController } from '../../controllers';
import { ReportsAnalyticsService, ReportsService } from '../../services';
import { ReportRepository } from '../../repositories/report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  controllers: [ReportsController],
  providers: [ReportsAnalyticsService, ReportsService, ReportRepository],
  exports: [],
})
export class ReportsFeatureModule {}
