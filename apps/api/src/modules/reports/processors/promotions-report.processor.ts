import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportEventType } from '../enums/report-event-type.enum';
import { addAmount, parseAmount } from '../domain/report-amount.util';
import { toSummaryDate } from '../domain/report-date.util';
import { PromotionUsageSummaryRepository } from '../repositories/promotion-usage-summary.repository';
import { ReportIngestEventInput } from '../types/report-ingest-event.input';

@Injectable()
export class PromotionsReportProcessor {
  constructor(private readonly repository: PromotionUsageSummaryRepository) {}

  supports(eventType: ReportEventType): boolean {
    return eventType === ReportEventType.PROMOTION_APPLIED;
  }

  async process(event: ReportIngestEventInput, manager?: EntityManager): Promise<void> {
    const promotionId = String(event.payload.promotionId ?? '');
    if (!promotionId) {
      return;
    }

    const summaryDate = toSummaryDate(event.occurredAt ?? new Date());
    const row = await this.repository.findOrCreateForDatePromotion(
      event.tenantId,
      summaryDate,
      promotionId,
      manager,
    );

    row.applicationCount += 1;
    row.totalDiscount = addAmount(
      row.totalDiscount,
      parseAmount(String(event.payload.discountAmount ?? 0)),
    );

    await this.repository.save(row, manager);
  }
}
