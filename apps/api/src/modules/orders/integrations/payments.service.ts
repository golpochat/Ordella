import { Injectable, Logger } from '@nestjs/common';
import { OrderPaymentContext } from '../types/order-payment.context';

export type PaymentAuthorizationStatus =
  | 'authorized'
  | 'captured'
  | 'skipped'
  | 'failed';

export interface AuthorizeOrCaptureResult {
  paymentId: string | null;
  status: PaymentAuthorizationStatus;
  failureReason?: string;
}

export interface RefundResult {
  refundId: string | null;
  status: 'succeeded' | 'skipped' | 'failed';
  failureReason?: string;
}

/** Placeholder for PaymentsModule — no payment gateway logic. */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async authorizeOrCapture(
    context: OrderPaymentContext,
  ): Promise<AuthorizeOrCaptureResult> {
    this.logger.debug(
      `[placeholder] PaymentsService.authorizeOrCapture tenant=${context.tenant.tenantId} order=${context.order.id} total=${context.order.total} method=${context.paymentMethod ?? 'n/a'} ${context.fromStatus}→${context.toStatus}`,
    );

    return {
      paymentId: null,
      status: 'captured',
    };
  }

  async refund(context: OrderPaymentContext): Promise<RefundResult> {
    this.logger.debug(
      `[placeholder] PaymentsService.refund tenant=${context.tenant.tenantId} order=${context.order.id} reason=${context.reason ?? 'n/a'}`,
    );

    return {
      refundId: null,
      status: 'succeeded',
    };
  }
}
