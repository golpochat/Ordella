import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import { throwInvalidDeliveryTransition } from './delivery-domain.errors';

const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryTaskStatus, DeliveryTaskStatus[]> = {
  [DeliveryTaskStatus.PENDING]: [DeliveryTaskStatus.ASSIGNED, DeliveryTaskStatus.CANCELLED],
  [DeliveryTaskStatus.ASSIGNED]: [
    DeliveryTaskStatus.EN_ROUTE,
    DeliveryTaskStatus.CANCELLED,
    DeliveryTaskStatus.FAILED,
  ],
  [DeliveryTaskStatus.EN_ROUTE]: [
    DeliveryTaskStatus.DELIVERED,
    DeliveryTaskStatus.CANCELLED,
    DeliveryTaskStatus.FAILED,
  ],
  [DeliveryTaskStatus.DELIVERED]: [],
  [DeliveryTaskStatus.CANCELLED]: [],
  [DeliveryTaskStatus.FAILED]: [],
};

export function assertDeliveryStatusTransition(
  from: DeliveryTaskStatus,
  to: DeliveryTaskStatus,
): void {
  if (from === to) {
    return;
  }

  if (!DELIVERY_STATUS_TRANSITIONS[from].includes(to)) {
    throwInvalidDeliveryTransition(from, to);
  }
}
