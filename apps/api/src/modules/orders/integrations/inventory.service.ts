import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

export type InventoryOrderAction = 'reserve' | 'deduct';

export interface ReserveOrDeductResult {
  reservationIds: string[];
  action: InventoryOrderAction;
}

/** Placeholder for InventoryModule — no external integration. */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  async reserveOrDeduct(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    action: InventoryOrderAction = 'reserve',
  ): Promise<ReserveOrDeductResult> {
    this.logger.debug(
      `[placeholder] InventoryService.reserveOrDeduct action=${action} tenant=${tenant.tenantId} order=${order.id} lines=${items.length}`,
    );
    return { reservationIds: [], action };
  }

  async restore(
    tenant: TenantContext,
    order: OrderEntity,
    items?: OrderItemEntity[],
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] InventoryService.restore tenant=${tenant.tenantId} order=${order.id} lines=${items?.length ?? 0}`,
    );
  }
}
