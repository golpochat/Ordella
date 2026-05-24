import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrdersDomainEvents } from '../events/orders.events';

/** Placeholder — emits reporting/analytics events via ReportsModule when integrated. */
@Injectable()
export class OrderReportingHook {
  private readonly logger = new Logger(OrderReportingHook.name);

  async emitOrderCreated(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] reporting ${OrdersDomainEvents.ORDER_CREATED} tenant=${tenant.tenantId} order=${order.id}`,
    );
  }

  async emitStatusChanged(
    tenant: TenantContext,
    order: OrderEntity,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] reporting ${OrdersDomainEvents.ORDER_STATUS_CHANGED} tenant=${tenant.tenantId} order=${order.id} ${fromStatus}→${toStatus}`,
    );
  }

  async emitOrderCompleted(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] reporting order.completed tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
