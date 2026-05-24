import { PaymentEntity } from '../entities/payment.entity';
import { PaymentOrderContext } from '../types/payment-order.context';

export interface GatewayAuthorizeResult {
  externalRef: string | null;
  authorized: boolean;
  failureReason?: string;
  errorCode?: string;
}

export interface GatewayCaptureResult {
  externalRef: string | null;
  captured: boolean;
  failureReason?: string;
  errorCode?: string;
}

export interface GatewayRefundResult {
  externalRef: string | null;
  succeeded: boolean;
  failureReason?: string;
  errorCode?: string;
}

export interface PaymentGateway {
  authorize(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayAuthorizeResult>;

  capture(
    payment: PaymentEntity,
    context: PaymentOrderContext,
  ): Promise<GatewayCaptureResult>;

  refund(
    payment: PaymentEntity,
    context: PaymentOrderContext,
    amount: string,
  ): Promise<GatewayRefundResult>;
}
