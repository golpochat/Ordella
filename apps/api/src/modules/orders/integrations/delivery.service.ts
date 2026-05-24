import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderType } from '../enums/order-type.enum';

export interface CreateDeliveryTaskResult {
  taskId: string | null;
}

/** Placeholder for DeliveriesModule — no external integration. */
@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  async createTask(
    tenant: TenantContext,
    order: OrderEntity,
  ): Promise<CreateDeliveryTaskResult> {
    if (order.orderType !== OrderType.DELIVERY) {
      return { taskId: null };
    }
    this.logger.debug(
      `[placeholder] DeliveryService.createTask tenant=${tenant.tenantId} order=${order.id}`,
    );
    return { taskId: null };
  }

  async assignDriver(tenant: TenantContext, order: OrderEntity): Promise<void> {
    if (order.orderType !== OrderType.DELIVERY) {
      return;
    }
    this.logger.debug(
      `[placeholder] DeliveryService.assignDriver tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
