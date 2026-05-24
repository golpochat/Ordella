import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ReportEventRepository } from '../repositories/report-event.repository';
import { ReportIngestEventInput } from '../types/report-ingest-event.input';
import {
  DeliveryReportProcessor,
  InventoryReportProcessor,
  PromotionsReportProcessor,
  SalesReportProcessor,
} from '../processors';

@Injectable()
export class ReportsIngestService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reportEventRepository: ReportEventRepository,
    private readonly salesProcessor: SalesReportProcessor,
    private readonly inventoryProcessor: InventoryReportProcessor,
    private readonly deliveryProcessor: DeliveryReportProcessor,
    private readonly promotionsProcessor: PromotionsReportProcessor,
  ) {}

  async ingestEvent(event: ReportIngestEventInput): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const saved = await this.reportEventRepository.append(
        event.tenantId,
        event.eventType,
        event.payload,
        manager,
      );

      await this.routeToProcessors(event, manager);

      return saved.id;
    });
  }

  private async routeToProcessors(
    event: ReportIngestEventInput,
    manager: EntityManager,
  ): Promise<void> {
    if (this.salesProcessor.supports(event.eventType)) {
      await this.salesProcessor.process(event, manager);
    }
    if (this.inventoryProcessor.supports(event.eventType)) {
      await this.inventoryProcessor.process(event, manager);
    }
    if (this.deliveryProcessor.supports(event.eventType)) {
      await this.deliveryProcessor.process(event, manager);
    }
    if (this.promotionsProcessor.supports(event.eventType)) {
      await this.promotionsProcessor.process(event, manager);
    }
  }
}
