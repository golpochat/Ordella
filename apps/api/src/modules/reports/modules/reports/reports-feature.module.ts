import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '../../entities/report.entity';
import { ReportsController } from '../../controllers/reports.controller';
import { ReportsAnalyticsService, ReportsService } from '../../services/reports.service';
import { ReportRepository } from '../../repositories/report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  controllers: [ReportsController],
  providers: [ReportsAnalyticsService, ReportsService, ReportRepository],
  exports: [],
})
export class ReportsFeatureModule {}
