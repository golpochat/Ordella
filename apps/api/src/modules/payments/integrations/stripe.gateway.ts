import { Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentOrderContext } from '../types/payment-order.context';
import {
  GatewayAuthorizeResult,
  GatewayCaptureResult,
  GatewayRefundResult,
  PaymentGateway,
} from './payment-gateway.interface';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);

  async authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    this.logger.debug(
      `[placeholder] StripeGateway.authorize payment=${payment.id} order=${context.orderId}`,
    );
    return {
      externalRef: `stripe_pi_${payment.id.slice(0, 8)}`,
      authorized: true,
    };
  }

  async capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    this.logger.debug(
      `[placeholder] StripeGateway.capture payment=${payment.id} order=${context.orderId}`,
    );
    return {
      externalRef: payment.providerPaymentId ?? `stripe_ch_${payment.id.slice(0, 8)}`,
      captured: true,
    };
  }

  async refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    this.logger.debug(
      `[placeholder] StripeGateway.refund payment=${payment.id} amount=${amount}`,
    );
    return {
      externalRef: `stripe_re_${payment.id.slice(0, 8)}`,
      succeeded: true,
    };
  }
}
