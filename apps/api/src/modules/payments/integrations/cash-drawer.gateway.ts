import { Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentOrderContext } from '../types/payment-order.context';
import {
  GatewayAuthorizeResult,
  GatewayCaptureResult,
  GatewayRefundResult,
  PaymentGateway,
} from './payment-gateway.interface';

/** Placeholder — POS cash drawer / in-person cash settlement */
@Injectable()
export class CashDrawerGateway implements PaymentGateway {
  private readonly logger = new Logger(CashDrawerGateway.name);

  async authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    this.logger.debug(`[placeholder] CashDrawerGateway.authorize payment=${payment.id}`);
    void context;
    return { externalRef: `cash_${payment.id.slice(0, 8)}`, authorized: true };
  }

  async capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    this.logger.debug(`[placeholder] CashDrawerGateway.capture payment=${payment.id}`);
    void context;
    return { externalRef: `cash_${payment.id.slice(0, 8)}`, captured: true };
  }

  async refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    this.logger.debug(`[placeholder] CashDrawerGateway.refund payment=${payment.id} amount=${amount}`);
    void context;
    return { externalRef: `cash_ref_${payment.id.slice(0, 8)}`, succeeded: true };
  }
}
