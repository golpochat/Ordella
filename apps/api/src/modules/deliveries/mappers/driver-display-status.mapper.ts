import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';

export type DriverDisplayStatus =
  | 'unassigned'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'delivered';

export function mapDriverDisplayStatus(
  status: DeliveryTaskStatus | null | undefined,
  hasDriver: boolean,
): DriverDisplayStatus | null {
  if (!status) {
    return hasDriver ? 'driver_assigned' : 'unassigned';
  }
  switch (status) {
    case DeliveryTaskStatus.PENDING:
      return hasDriver ? 'driver_assigned' : 'unassigned';
    case DeliveryTaskStatus.ASSIGNED:
      return 'driver_assigned';
    case DeliveryTaskStatus.EN_ROUTE:
      return 'driver_en_route';
    case DeliveryTaskStatus.DELIVERED:
      return 'delivered';
    default:
      return null;
  }
}

export function labelDriverDisplayStatus(status: DriverDisplayStatus | null): string | null {
  if (!status) return null;
  const labels: Record<DriverDisplayStatus, string> = {
    unassigned: 'Awaiting driver',
    driver_assigned: 'Driver assigned',
    driver_en_route: 'Driver en route',
    delivered: 'Delivered',
  };
  return labels[status];
}
