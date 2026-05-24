import { Injectable, Logger } from '@nestjs/common';
import { OrderReportingEventType } from '../enums/order-reporting-event-type.enum';
import { OrderReportingContext } from '../types/order-reporting.context';

/** Placeholder for ReportsModule — no analytics pipeline or warehouse writes. */
@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  emit(
    context: OrderReportingContext,
    eventType: OrderReportingEventType,
    payload: Record<string, unknown>,
  ): void {
    this.logger.debug(
      `[placeholder] ReportingService.emit event=${eventType} tenant=${context.tenant.tenantId} order=${context.order.id} payload=${JSON.stringify(payload)}`,
    );
  }
}
