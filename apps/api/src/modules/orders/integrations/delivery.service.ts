import { Injectable, Logger } from '@nestjs/common';
import { OrderType } from '../enums/order-type.enum';
import { OrderDeliveryContext } from '../types/order-delivery.context';

export interface CreateDeliveryTaskResult {
  taskId: string | null;
}

export interface AssignDriverResult {
  driverId: string | null;
}

/** Placeholder for DeliveriesModule — no routing or driver tracking. */
@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  async createTask(context: OrderDeliveryContext): Promise<CreateDeliveryTaskResult> {
    if (context.order.orderType !== OrderType.DELIVERY) {
      return { taskId: null };
    }
    this.logger.debug(
      `[placeholder] DeliveryService.createTask tenant=${context.tenant.tenantId} order=${context.order.id}`,
    );
    return { taskId: null };
  }

  async assignDriver(context: OrderDeliveryContext): Promise<AssignDriverResult> {
    if (context.order.orderType !== OrderType.DELIVERY) {
      return { driverId: null };
    }
    this.logger.debug(
      `[placeholder] DeliveryService.assignDriver tenant=${context.tenant.tenantId} order=${context.order.id}`,
    );
    return { driverId: null };
  }

  async markOutForDelivery(context: OrderDeliveryContext): Promise<void> {
    if (context.order.orderType !== OrderType.DELIVERY) {
      return;
    }
    this.logger.debug(
      `[placeholder] DeliveryService.markOutForDelivery tenant=${context.tenant.tenantId} order=${context.order.id} ${context.fromStatus}→${context.toStatus}`,
    );
  }

  async markDelivered(context: OrderDeliveryContext): Promise<void> {
    this.logger.debug(
      `[placeholder] DeliveryService.markDelivered tenant=${context.tenant.tenantId} order=${context.order.id} type=${context.order.orderType}`,
    );
  }
}
