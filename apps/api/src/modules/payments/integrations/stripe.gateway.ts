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

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);

  constructor(private readonly stripeClient: StripeClientService) {}

  async authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    const intentId =
      context.stripePaymentIntentId ?? payment.providerPaymentId ?? null;

    if (!this.stripeClient.isConfigured()) {
      this.logger.debug(
        `[placeholder] StripeGateway.authorize payment=${payment.id} order=${context.orderId}`,
      );
      return {
        externalRef: intentId ?? `stripe_pi_${payment.id.slice(0, 8)}`,
        authorized: true,
      };
    }

    if (!intentId) {
      return {
        externalRef: null,
        authorized: false,
        failureReason: 'Stripe payment intent is required for card payments',
        errorCode: 'stripe_intent_missing',
      };
    }

    const intent = await this.stripeClient.client().paymentIntents.retrieve(intentId);
    const ok =
      intent.status === 'succeeded' ||
      intent.status === 'requires_capture' ||
      intent.status === 'processing';

    if (!ok) {
      return {
        externalRef: intentId,
        authorized: false,
        failureReason: `Payment intent status: ${intent.status}`,
        errorCode: 'stripe_intent_not_ready',
      };
    }

    return { externalRef: intentId, authorized: true };
  }

  async capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    const intentId =
      context.stripePaymentIntentId ?? payment.providerPaymentId ?? null;

    if (!this.stripeClient.isConfigured()) {
      return {
        externalRef: intentId ?? `stripe_ch_${payment.id.slice(0, 8)}`,
        captured: true,
      };
    }

    if (!intentId) {
      return {
        externalRef: null,
        captured: false,
        failureReason: 'Stripe payment intent is required',
        errorCode: 'stripe_intent_missing',
      };
    }

    let intent = await this.stripeClient.client().paymentIntents.retrieve(intentId);

    if (intent.status === 'requires_capture') {
      intent = await this.stripeClient.client().paymentIntents.capture(intentId);
    }

    if (intent.status !== 'succeeded') {
      return {
        externalRef: intentId,
        captured: false,
        failureReason: `Payment intent status: ${intent.status}`,
        errorCode: 'stripe_capture_failed',
      };
    }

    return { externalRef: intentId, captured: true };
  }

  async refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    const intentId =
      context.stripePaymentIntentId ?? payment.providerPaymentId ?? null;

    if (!this.stripeClient.isConfigured()) {
      return { externalRef: `stripe_re_${payment.id.slice(0, 8)}`, succeeded: true };
    }

    if (!intentId) {
      return {
        externalRef: null,
        succeeded: false,
        failureReason: 'No Stripe payment intent to refund',
        errorCode: 'stripe_intent_missing',
      };
    }

    const amountCents = Math.round(parseFloat(amount) * 100);
    const refund = await this.stripeClient.client().refunds.create({
      payment_intent: intentId,
      amount: amountCents,
      metadata: { orderId: context.orderId, tenantId: context.tenantId },
    });

    return {
      externalRef: refund.id,
      succeeded: refund.status === 'succeeded' || refund.status === 'pending',
    };
  }
}
