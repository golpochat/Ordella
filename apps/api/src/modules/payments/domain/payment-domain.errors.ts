import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../enums/payment-status.enum';

export function throwPaymentNotFound(paymentId: string): never {
  throw new NotFoundException(`Payment ${paymentId} not found`);
}

export function throwPaymentForOrderNotFound(orderId: string): never {
  throw new NotFoundException(`Payment for order ${orderId} not found`);
}

export function throwDoubleCapture(paymentId: string): never {
  throw new BadRequestException(`Payment ${paymentId} is already captured`);
}

export function throwRefundExceedsCaptured(
  requested: string,
  refundable: string,
): never {
  throw new BadRequestException(
    `Refund amount ${requested} exceeds refundable balance ${refundable}`,
  );
}

export function throwRefundOnUnpaidPayment(status: PaymentStatus): never {
  throw new BadRequestException(
    `Cannot refund payment in status "${status}" — payment must be captured first`,
  );
}

export function throwInvalidPaymentAmount(amount: string): never {
  throw new BadRequestException(`Invalid payment amount: ${amount}`);
}
