import { Injectable, Logger } from '@nestjs/common';
import { StockItemEntity } from '../entities/stock-item.entity';

/** Placeholder — future auto-replenishment rules engine. */
@Injectable()
export class AutoReplenishmentService {
  private readonly logger = new Logger(AutoReplenishmentService.name);

  evaluateAfterStockChange(item: StockItemEntity): void {
    this.logger.debug(
      `[placeholder] AutoReplenishmentService.evaluate tenant=${item.tenantId} sku=${item.sku}`,
    );
  }
}
