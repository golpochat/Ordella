import { Injectable } from '@nestjs/common';
import { ReportsQueryService } from '../../reports/services/reports-query.service';
import { ReportDateRange } from '../../reports/types/report-ingest-event.input';

@Injectable()
export class ReportsAdminService {
  constructor(private readonly reportsQueryService: ReportsQueryService) {}

  getDailySales(tenantId: string, dateRange: Partial<ReportDateRange>) {
    return this.reportsQueryService.getDailySales(tenantId, dateRange);
  }

  getInventoryMovements(tenantId: string, dateRange: Partial<ReportDateRange>) {
    return this.reportsQueryService.getInventoryMovements(tenantId, dateRange);
  }

  getDeliveryPerformance(tenantId: string, dateRange: Partial<ReportDateRange>) {
    return this.reportsQueryService.getDeliveryPerformance(tenantId, dateRange);
  }

  getPromotionUsage(tenantId: string, dateRange: Partial<ReportDateRange>) {
    return this.reportsQueryService.getPromotionUsage(tenantId, dateRange);
  }
}
