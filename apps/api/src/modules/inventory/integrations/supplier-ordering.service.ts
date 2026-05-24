import { Injectable, Logger } from '@nestjs/common';
import { StockItemEntity } from '../entities/stock-item.entity';

/** Placeholder — future supplier / purchase-order integration. */
@Injectable()
export class SupplierOrderingService {
  private readonly logger = new Logger(SupplierOrderingService.name);

  suggestPurchaseOrder(item: StockItemEntity): void {
    this.logger.debug(
      `[placeholder] SupplierOrderingService.suggest tenant=${item.tenantId} sku=${item.sku}`,
    );
  }
}
