import { Injectable, Logger } from '@nestjs/common';
import { StripeClientService } from '../../billing/services/stripe-client.service';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentOrderContext } from '../types/payment-order.context';
import {
  GatewayAuthorizeResult,
  GatewayCaptureResult,
  GatewayRefundResult,
  PaymentGateway,
} from './payment-gateway.interface';
import { StripeGateway } from './stripe.gateway';

/** In-person card payments via Stripe Terminal / PaymentIntent */
@Injectable()
export class TerminalPaymentsGateway implements PaymentGateway {
  private readonly logger = new Logger(TerminalPaymentsGateway.name);

  constructor(
    private readonly stripeClient: StripeClientService,
    private readonly stripeGateway: StripeGateway,
  ) {}

  async authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    if (context.stripePaymentIntentId || payment.providerPaymentId) {
      return this.stripeGateway.authorize(payment, context);
    }

    if (!this.stripeClient.isConfigured()) {
      this.logger.debug(`[placeholder] TerminalPaymentsGateway.authorize payment=${payment.id}`);
      return { externalRef: `terminal_${payment.id.slice(0, 8)}`, authorized: true };
    }

    return {
      externalRef: null,
      authorized: false,
      failureReason:
        'Connect a card reader or provide a payment intent for in-store card payments',
      errorCode: 'terminal_intent_required',
    };
  }

  async capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    if (context.stripePaymentIntentId || payment.providerPaymentId) {
      return this.stripeGateway.capture(payment, context);
    }

    if (!this.stripeClient.isConfigured()) {
      return { externalRef: `terminal_${payment.id.slice(0, 8)}`, captured: true };
    }

    return {
      externalRef: null,
      captured: false,
      failureReason: 'Terminal payment intent not confirmed',
      errorCode: 'terminal_capture_failed',
    };
  }

  async refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    if (context.stripePaymentIntentId || payment.providerPaymentId) {
      return this.stripeGateway.refund(payment, context, amount);
    }

    if (!this.stripeClient.isConfigured()) {
      return { externalRef: `terminal_ref_${payment.id.slice(0, 8)}`, succeeded: true };
    }

    return {
      externalRef: null,
      succeeded: false,
      failureReason: 'No terminal payment to refund',
      errorCode: 'terminal_refund_failed',
    };
  }
}
