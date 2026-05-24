import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';

export interface AuthorizeOrCaptureResult {
  paymentId: string | null;
  status: 'authorized' | 'captured' | 'skipped';
}

/** Placeholder for PaymentsModule — no payment gateway logic. */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async authorizeOrCapture(
    tenant: TenantContext,
    order: OrderEntity,
  ): Promise<AuthorizeOrCaptureResult> {
    this.logger.debug(
      `[placeholder] PaymentsService.authorizeOrCapture tenant=${tenant.tenantId} order=${order.id} total=${order.total}`,
    );
    return { paymentId: null, status: 'skipped' };
  }

  async refund(
    tenant: TenantContext,
    order: OrderEntity,
    reason?: string,
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] PaymentsService.refund tenant=${tenant.tenantId} order=${order.id} reason=${reason ?? 'n/a'}`,
    );
  }
}
