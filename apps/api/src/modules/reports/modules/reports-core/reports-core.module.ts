import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DailySalesSummaryEntity,
  DeliveryPerformanceSummaryEntity,
  InventoryMovementSummaryEntity,
  PromotionUsageSummaryEntity,
  ReportEventEntity,
} from '../../entities';
import { ReportsIngestService } from '../../services/reports-ingest.service';
import { ReportsQueryService } from '../../services/reports-query.service';
import { ReportEventRepository } from '../../repositories/report-event.repository';
import { DailySalesSummaryRepository } from '../../repositories/daily-sales-summary.repository';
import { InventoryMovementSummaryRepository } from '../../repositories/inventory-movement-summary.repository';
import { DeliveryPerformanceSummaryRepository } from '../../repositories/delivery-performance-summary.repository';
import { PromotionUsageSummaryRepository } from '../../repositories/promotion-usage-summary.repository';
import {
  DeliveryReportProcessor,
  InventoryReportProcessor,
  PromotionsReportProcessor,
  SalesReportProcessor,
} from '../../processors';
import { BiToolsService, CsvExportService, ScheduledReportsService } from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEventEntity,
      DailySalesSummaryEntity,
      InventoryMovementSummaryEntity,
      DeliveryPerformanceSummaryEntity,
      PromotionUsageSummaryEntity,
    ]),
  ],
  providers: [
    ReportsIngestService,
    ReportsQueryService,
    ReportEventRepository,
    DailySalesSummaryRepository,
    InventoryMovementSummaryRepository,
    DeliveryPerformanceSummaryRepository,
    PromotionUsageSummaryRepository,
    SalesReportProcessor,
    InventoryReportProcessor,
    DeliveryReportProcessor,
    PromotionsReportProcessor,
    BiToolsService,
    CsvExportService,
    ScheduledReportsService,
  ],
  exports: [ReportsIngestService, ReportsQueryService],
})
export class ReportsCoreModule {}
