import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';

/** Placeholder — coordinates PaymentsModule (no gateway logic). */
@Injectable()
export class OrderPaymentHook {
  private readonly logger = new Logger(OrderPaymentHook.name);

  async requestConfirmation(
    tenant: TenantContext,
    order: OrderEntity,
  ): Promise<{ paymentIntentId: string | null }> {
    this.logger.debug(
      `[placeholder] request payment confirmation tenant=${tenant.tenantId} order=${order.id} total=${order.total}`,
    );
    return { paymentIntentId: null };
  }

  async confirmPayment(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] confirm payment tenant=${tenant.tenantId} order=${order.id}`,
    );
  }

  async markPaymentFailed(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] mark payment failed tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
