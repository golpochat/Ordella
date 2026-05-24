import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportEventType } from '../enums/report-event-type.enum';
import { addAmount, parseAmount } from '../domain/report-amount.util';
import { toSummaryDate } from '../domain/report-date.util';
import { DeliveryPerformanceSummaryRepository } from '../repositories/delivery-performance-summary.repository';
import { ReportIngestEventInput } from '../types/report-ingest-event.input';

@Injectable()
export class DeliveryReportProcessor {
  constructor(private readonly repository: DeliveryPerformanceSummaryRepository) {}

  supports(eventType: ReportEventType): boolean {
    return eventType === ReportEventType.DELIVERY_COMPLETED;
  }

  async process(event: ReportIngestEventInput, manager?: EntityManager): Promise<void> {
    const summaryDate = toSummaryDate(event.occurredAt ?? new Date());
    const row = await this.repository.findOrCreateForDate(
      event.tenantId,
      summaryDate,
      manager,
    );

    const failed = Boolean(event.payload.failed);
    const durationSeconds = parseAmount(String(event.payload.durationSeconds ?? 0));

    if (failed) {
      row.failed += 1;
    } else {
      const prevCompleted = row.completed;
      row.completed += 1;
      const totalDuration = parseAmount(row.avgDeliveryTime) * prevCompleted + durationSeconds;
      row.avgDeliveryTime = addAmount('0', totalDuration / row.completed);
    }

    await this.repository.save(row, manager);
  }
}
