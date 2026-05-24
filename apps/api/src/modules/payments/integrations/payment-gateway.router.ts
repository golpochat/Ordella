import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentOrderContext } from '../types/payment-order.context';
import {
  GatewayAuthorizeResult,
  GatewayCaptureResult,
  GatewayRefundResult,
  PaymentGateway,
} from './payment-gateway.interface';
import { StripeGateway } from './stripe.gateway';
import { PayPalGateway } from './paypal.gateway';
import { SquareGateway } from './square.gateway';
import { CashDrawerGateway } from './cash-drawer.gateway';
import { TerminalPaymentsGateway } from './terminal-payments.gateway';

@Injectable()
export class PaymentGatewayRouter {
  constructor(
    private readonly stripeGateway: StripeGateway,
    private readonly payPalGateway: PayPalGateway,
    private readonly squareGateway: SquareGateway,
    private readonly cashDrawerGateway: CashDrawerGateway,
    private readonly terminalPaymentsGateway: TerminalPaymentsGateway,
  ) {}

  resolve(provider: PaymentProvider): PaymentGateway {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return this.stripeGateway;
      case PaymentProvider.PAYPAL:
        return this.payPalGateway;
      case PaymentProvider.SQUARE:
        return this.squareGateway;
      case PaymentProvider.CASH:
        return this.cashDrawerGateway;
      case PaymentProvider.TERMINAL:
        return this.terminalPaymentsGateway;
      default:
        return this.cashDrawerGateway;
    }
  }

  authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    return this.resolve(payment.provider).authorize(payment, context);
  }

  capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    return this.resolve(payment.provider).capture(payment, context);
  }

  refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    return this.resolve(payment.provider).refund(payment, context, amount);
  }
}
