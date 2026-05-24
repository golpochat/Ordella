import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportEventType } from '../enums/report-event-type.enum';
import { addQty, parseAmount } from '../domain/report-amount.util';
import { toSummaryDate } from '../domain/report-date.util';
import { InventoryMovementSummaryRepository } from '../repositories/inventory-movement-summary.repository';
import { ReportIngestEventInput } from '../types/report-ingest-event.input';

@Injectable()
export class InventoryReportProcessor {
  constructor(private readonly repository: InventoryMovementSummaryRepository) {}

  supports(eventType: ReportEventType): boolean {
    return [ReportEventType.INVENTORY_DEDUCTED, ReportEventType.INVENTORY_RESTORED].includes(
      eventType,
    );
  }

  async process(event: ReportIngestEventInput, manager?: EntityManager): Promise<void> {
    const productId = String(event.payload.productId ?? '');
    if (!productId) {
      return;
    }

    const summaryDate = toSummaryDate(event.occurredAt ?? new Date());
    const row = await this.repository.findOrCreateForDateProduct(
      event.tenantId,
      summaryDate,
      productId,
      manager,
    );

    const quantity = parseAmount(String(event.payload.quantity ?? 0));

    if (event.eventType === ReportEventType.INVENTORY_DEDUCTED) {
      row.quantityOut = addQty(row.quantityOut, quantity);
    } else {
      row.quantityIn = addQty(row.quantityIn, quantity);
    }

    await this.repository.save(row, manager);
  }
}
