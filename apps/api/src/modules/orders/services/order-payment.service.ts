import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderEntity } from '../entities/order.entity';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { PaymentsService } from '../integrations/payments.service';
import { OrderPaymentContext } from '../types/order-payment.context';

/**
 * Applies payment placeholder results to the order header.
 * Isolated from lifecycle orchestration and gateway implementations.
 */
@Injectable()
export class OrderPaymentService {
  private readonly logger = new Logger(OrderPaymentService.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  async confirmOnAccepted(
    context: OrderPaymentContext,
    order: OrderEntity,
  ): Promise<void> {
    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      return;
    }

    const result = await this.paymentsService.authorizeOrCapture(context);

    if (result.status === 'failed') {
      order.paymentStatus = OrderPaymentStatus.PAYMENT_FAILED;
      const message = result.failureReason ?? 'Payment authorization failed';
      this.logger.warn(
        `Payment authorization failed for order ${order.id}: ${message}`,
      );
      throw new BadRequestException(message);
    }

    order.paymentStatus = OrderPaymentStatus.PAID;
  }

  async refundOnRefunded(
    context: OrderPaymentContext,
    order: OrderEntity,
  ): Promise<void> {
    const result = await this.paymentsService.refund(context);

    if (result.status === 'failed') {
      const message = result.failureReason ?? 'Payment refund failed';
      this.logger.warn(`Payment refund failed for order ${order.id}: ${message}`);
      throw new BadRequestException(message);
    }

    order.paymentStatus = OrderPaymentStatus.REFUNDED;
  }

  async refundOnCancelled(
    context: OrderPaymentContext,
    order: OrderEntity,
  ): Promise<void> {
    if (order.paymentStatus !== OrderPaymentStatus.PAID) {
      return;
    }

    const result = await this.paymentsService.refund(context);

    if (result.status === 'failed') {
      this.logger.warn(
        `[placeholder] Cancel refund failed for order ${order.id}: ${result.failureReason ?? 'unknown'}`,
      );
      return;
    }

    order.paymentStatus = OrderPaymentStatus.REFUNDED;
  }
}
