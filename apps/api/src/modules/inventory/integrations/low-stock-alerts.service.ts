import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationEntity } from '../../notifications/entities/notification.entity';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationStatus } from '../../notifications/enums/notification-status.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { StockItemEntity } from '../entities/stock-item.entity';
import { parseQty } from '../domain/stock-quantity.util';

@Injectable()
export class LowStockAlertsService {
  private readonly logger = new Logger(LowStockAlertsService.name);

  constructor(private readonly dataSource: DataSource) {}

  checkAfterStockChange(item: StockItemEntity): void {
    if (!item.reorderLevel) {
      return;
    }

    const onHand = parseQty(item.quantityOnHand);
    const reorder = parseQty(item.reorderLevel);

    if (onHand <= reorder) {
      this.logger.debug(
        `LowStockAlertsService tenant=${item.tenantId} sku=${item.sku} onHand=${onHand} reorder=${reorder}`,
      );
      void this.recordAlert(item, onHand, reorder);
    }
  }

  private async recordAlert(
    item: StockItemEntity,
    stockLevel: number,
    reorderPoint: number,
  ): Promise<void> {
    const repository = this.dataSource.getRepository(NotificationEntity);
    const recent = await repository
      .createQueryBuilder('notification')
      .where('notification.tenantId = :tenantId', { tenantId: item.tenantId })
      .andWhere('notification.type = :type', { type: NotificationType.LOW_STOCK })
      .andWhere("notification.payload ->> 'stockItemId' = :stockItemId", { stockItemId: item.id })
      .andWhere("notification.createdAt > NOW() - INTERVAL '1 hour'")
      .getOne();
    if (recent) {
      return;
    }
    await repository.save(
      repository.create({
        tenantId: item.tenantId,
        type: NotificationType.LOW_STOCK,
        channel: NotificationChannelType.PUSH,
        userId: null,
        recipient: null,
        payload: {
          templateName: stockLevel <= 0 ? 'out_of_stock' : 'low_stock',
          stockItemId: item.id,
          itemName: item.name,
          sku: item.sku,
          stockLevel,
          reorderPoint,
          message:
            stockLevel <= 0
              ? `${item.name} is out of stock`
              : `${item.name} is at or below reorder point`,
        },
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      }),
    );
  }
}
