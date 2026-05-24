import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { REPORTS_ENTITIES } from './entities';
import { ReportsFeatureModule } from './modules/reports/reports-feature.module';
import { ReportDefinitionsModule } from './modules/report-definitions/report-definitions.module';
import { ReportJobsModule } from './modules/report-jobs/report-jobs.module';
import { ReportResultsModule } from './modules/report-results/report-results.module';
import { ReportsCoreModule } from './modules/reports-core/reports-core.module';

/**
 * Reports domain — SRS §14, API Spec §12 (blueprint Reporting Service).
 *
 * Routes (/api/v1):
 * - /reports/sales|orders|customers|inventory, POST /reports/export
 * - /report-definitions, /report-jobs, /report-results
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(REPORTS_ENTITIES),
    ReportDefinitionsModule,
    ReportsFeatureModule,
    ReportJobsModule,
    ReportResultsModule,
    ReportsCoreModule,
  ],
  exports: [ReportsCoreModule],
})
export class ReportsModule {}
