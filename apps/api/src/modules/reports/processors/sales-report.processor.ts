import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportEventType } from '../enums/report-event-type.enum';
import { addAmount, parseAmount } from '../domain/report-amount.util';
import { toSummaryDate } from '../domain/report-date.util';
import { DailySalesSummaryRepository } from '../repositories/daily-sales-summary.repository';
import { ReportIngestEventInput } from '../types/report-ingest-event.input';

@Injectable()
export class SalesReportProcessor {
  constructor(private readonly repository: DailySalesSummaryRepository) {}

  supports(eventType: ReportEventType): boolean {
    return [
      ReportEventType.ORDER_CREATED,
      ReportEventType.ORDER_CONFIRMED,
      ReportEventType.ORDER_COMPLETED,
      ReportEventType.ORDER_CANCELLED,
      ReportEventType.ORDER_REFUNDED,
      ReportEventType.PAYMENT_CAPTURED,
      ReportEventType.PAYMENT_REFUNDED,
    ].includes(eventType);
  }

  async process(event: ReportIngestEventInput, manager?: EntityManager): Promise<void> {
    const summaryDate = toSummaryDate(event.occurredAt ?? new Date());
    const row = await this.repository.findOrCreateForDate(
      event.tenantId,
      summaryDate,
      manager,
    );

    const amount = parseAmount(String(event.payload.amount ?? event.payload.total ?? 0));
    const discount = parseAmount(String(event.payload.discountAmount ?? event.payload.discount ?? 0));

    switch (event.eventType) {
      case ReportEventType.ORDER_CREATED:
        row.totalOrders += 1;
        break;
      case ReportEventType.ORDER_CONFIRMED:
      case ReportEventType.ORDER_COMPLETED:
      case ReportEventType.PAYMENT_CAPTURED:
        row.totalRevenue = addAmount(row.totalRevenue, amount);
        row.totalDiscounts = addAmount(row.totalDiscounts, discount);
        break;
      case ReportEventType.ORDER_REFUNDED:
      case ReportEventType.PAYMENT_REFUNDED:
        row.totalRefunds = addAmount(row.totalRefunds, amount);
        break;
      case ReportEventType.ORDER_CANCELLED:
        break;
      default:
        break;
    }

    await this.repository.save(row, manager);
  }
}
