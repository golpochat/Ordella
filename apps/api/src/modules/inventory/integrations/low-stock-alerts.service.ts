import { Injectable, Logger } from '@nestjs/common';
import { StockItemEntity } from '../entities/stock-item.entity';
import { parseQty } from '../domain/stock-quantity.util';

/** Placeholder — future NotificationsModule / alerting integration. */
@Injectable()
export class LowStockAlertsService {
  private readonly logger = new Logger(LowStockAlertsService.name);

  checkAfterStockChange(item: StockItemEntity): void {
    if (!item.reorderLevel) {
      return;
    }

    const onHand = parseQty(item.quantityOnHand);
    const reorder = parseQty(item.reorderLevel);

    if (onHand <= reorder) {
      this.logger.debug(
        `[placeholder] LowStockAlertsService tenant=${item.tenantId} sku=${item.sku} onHand=${onHand} reorder=${reorder}`,
      );
    }
  }
}
