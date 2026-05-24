import { OrderStatus } from '../enums/order-status.enum';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { OrderEntity } from '../entities/order.entity';
import { isTerminalOrderStatus } from './order-lifecycle.transitions';
import { throwOrderInTerminalStatus } from './order-domain.errors';

export type StatusTransitionResolution = 'noop' | 'proceed';

/** Same-status requests are idempotent (no hooks, no history). */
export function resolveStatusTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
): StatusTransitionResolution {
  if (fromStatus === toStatus) {
    return 'noop';
  }
  return 'proceed';
}

/** Blocks new transitions from terminal states (except same-status noop handled above). */
export function assertNotTransitioningFromTerminal(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
): void {
  if (fromStatus === toStatus) {
    return;
  }
  if (isTerminalOrderStatus(fromStatus)) {
    throwOrderInTerminalStatus(fromStatus);
  }
}

export function isPaymentConfirmIdempotent(order: OrderEntity): boolean {
  return order.paymentStatus === OrderPaymentStatus.PAID;
}

export function isPaymentRefundIdempotent(order: OrderEntity): boolean {
  return order.paymentStatus === OrderPaymentStatus.REFUNDED;
}

export function isOrderCancelled(order: OrderEntity): boolean {
  return order.status === OrderStatus.CANCELLED;
}

export function isOrderRefunded(order: OrderEntity): boolean {
  return order.status === OrderStatus.REFUNDED;
}
