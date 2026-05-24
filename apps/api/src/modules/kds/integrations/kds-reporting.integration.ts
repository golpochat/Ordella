import { Injectable, Logger } from '@nestjs/common';
import { ReportsIngestService } from '../../reports/services/reports-ingest.service';
import { ReportEventType } from '../../reports/enums/report-event-type.enum';
import { OrderStatus } from '../../orders/enums/order-status.enum';

/** Optional — emit fulfillment milestones to reporting ingest */
@Injectable()
export class KdsReportingIntegration {
  private readonly logger = new Logger(KdsReportingIntegration.name);

  constructor(private readonly reportsIngestService: ReportsIngestService) {}

  async emitOrderMilestone(
    tenantId: string,
    orderId: string,
    status: OrderStatus,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    const eventType = this.mapStatusToEvent(status);
    if (!eventType) {
      return;
    }

    try {
      await this.reportsIngestService.ingestEvent({
        tenantId,
        eventType,
        payload: { orderId, kdsStatus: status, ...payload },
        occurredAt: new Date(),
      });
    } catch (error) {
      this.logger.warn(
        `KDS reporting ingest failed for order ${orderId}: ${(error as Error).message}`,
      );
    }
  }

  private mapStatusToEvent(status: OrderStatus): ReportEventType | null {
    switch (status) {
      case OrderStatus.PREPARING:
        return ReportEventType.ORDER_CONFIRMED;
      case OrderStatus.READY:
        return ReportEventType.ORDER_COMPLETED;
      case OrderStatus.COMPLETED:
        return ReportEventType.ORDER_COMPLETED;
      default:
        return null;
    }
  }
}
