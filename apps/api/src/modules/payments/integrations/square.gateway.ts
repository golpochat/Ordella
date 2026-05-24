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
export class SquareGateway implements PaymentGateway {
  private readonly logger = new Logger(SquareGateway.name);

  async authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult> {
    this.logger.debug(`[placeholder] SquareGateway.authorize payment=${payment.id}`);
    void context;
    return { externalRef: `square_auth_${payment.id.slice(0, 8)}`, authorized: true };
  }

  async capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult> {
    this.logger.debug(`[placeholder] SquareGateway.capture payment=${payment.id}`);
    void context;
    return { externalRef: `square_cap_${payment.id.slice(0, 8)}`, captured: true };
  }

  async refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult> {
    this.logger.debug(`[placeholder] SquareGateway.refund payment=${payment.id} amount=${amount}`);
    void context;
    return { externalRef: `square_ref_${payment.id.slice(0, 8)}`, succeeded: true };
  }
}
