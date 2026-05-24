import { OrderStatus } from '../../orders/enums/order-status.enum';
import {
  assertOrderStatusTransition,
  canTransitionOrderStatus,
  isTerminalOrderStatus,
} from '../../orders/domain/order-lifecycle.transitions';
import { throwAdminOrderTerminal, throwAdminUnsafeOrderTransition } from './admin-domain.errors';

const OPEN_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

export function isOpenOrderStatus(status: OrderStatus): boolean {
  return OPEN_ORDER_STATUSES.includes(status);
}

export function assertAdminOrderStatusChange(
  from: OrderStatus,
  to: OrderStatus,
  adminOverride: boolean,
): void {
  if (isTerminalOrderStatus(from)) {
    throwAdminOrderTerminal(from);
  }

  if (adminOverride) {
    if (isTerminalOrderStatus(to)) {
      assertOrderStatusTransition(from, to);
      return;
    }
    if (from === to) {
      return;
    }
    return;
  }

  if (!canTransitionOrderStatus(from, to)) {
    throwAdminUnsafeOrderTransition(from, to);
  }
}
