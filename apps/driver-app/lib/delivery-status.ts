export type DeliveryTaskStatus =
  | 'pending'
  | 'assigned'
  | 'en_route'
  | 'delivered'
  | 'cancelled'
  | 'failed';

const TRANSITIONS: Record<DeliveryTaskStatus, DeliveryTaskStatus[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['en_route', 'cancelled', 'failed'],
  en_route: ['delivered', 'cancelled', 'failed'],
  delivered: [],
  cancelled: [],
  failed: [],
};

export function canTransition(from: DeliveryTaskStatus, to: DeliveryTaskStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: DeliveryTaskStatus, to: DeliveryTaskStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Cannot move from ${from} to ${to}`);
  }
}

export function statusLabel(status: DeliveryTaskStatus): string {
  const labels: Record<DeliveryTaskStatus, string> = {
    pending: 'Awaiting acceptance',
    assigned: 'Accepted',
    en_route: 'En route',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return labels[status];
}

export type TaskFilterTab = 'all' | DeliveryTaskStatus;

export const TASK_FILTER_TABS: { value: TaskFilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'en_route', label: 'En route' },
  { value: 'delivered', label: 'Delivered' },
];
