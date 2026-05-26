import { OrderStatus } from '../enums/order-status.enum';
import { throwInvalidOrderStatusTransition } from './order-domain.errors';

/** Valid status transitions (API Spec §5.7 + pickup shortcut to completed). */
export const ORDER_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.PENDING]: [
    OrderStatus.ACCEPTED,
    OrderStatus.CANCELLED,
    OrderStatus.FAILED,
  ],
  [OrderStatus.ACCEPTED]: [
    OrderStatus.PICKING,
    OrderStatus.PREPARING,
    OrderStatus.CANCELLED,
    OrderStatus.FAILED,
  ],
  [OrderStatus.PICKING]: [OrderStatus.PICKED, OrderStatus.READY, OrderStatus.CANCELLED, OrderStatus.FAILED],
  [OrderStatus.PICKED]: [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [
    OrderStatus.HANDED_TO_DRIVER,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.HANDED_TO_DRIVER]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED, OrderStatus.FAILED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.COMPLETED, OrderStatus.FAILED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.FAILED]: [],
};

export const ORDER_TERMINAL_STATUSES: readonly OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.REFUNDED,
  OrderStatus.CANCELLED,
  OrderStatus.FAILED,
];

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return ORDER_TERMINAL_STATUSES.includes(status);
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function assertOrderStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (from === to) {
    return;
  }
  if (!canTransitionOrderStatus(from, to)) {
    throwInvalidOrderStatusTransition(from, to);
  }
}
