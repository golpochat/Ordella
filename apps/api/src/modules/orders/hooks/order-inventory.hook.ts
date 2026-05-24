import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

/** Placeholder — soft-reserves stock via InventoryModule when integrated. */
@Injectable()
export class OrderInventoryHook {
  private readonly logger = new Logger(OrderInventoryHook.name);

  async reserveSoft(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
  ): Promise<{ reservationIds: string[] }> {
    this.logger.debug(
      `[placeholder] soft inventory reserve tenant=${tenant.tenantId} order=${order.id} lines=${items.length}`,
    );
    return { reservationIds: [] };
  }

  async releaseReservations(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] release inventory reservations tenant=${tenant.tenantId} order=${order.id}`,
    );
  }

  async commitReservations(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] commit inventory reservations tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
