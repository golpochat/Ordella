export type TimelineStep = {
  key: string;
  label: string;
};

export const ORDER_TIMELINE: TimelineStep[] = [
  { key: 'preparing', label: 'In fulfillment' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'completed', label: 'Delivered' },
];

const ACTIVE_STATUSES = new Set([
  'pending',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
]);

export function isActiveOrderStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}

export function timelineIndexForStatus(status: string): number {
  if (status === 'completed' || status === 'delivered') {
    return ORDER_TIMELINE.length;
  }
  const idx = ORDER_TIMELINE.findIndex((step) => step.key === status);
  if (idx >= 0) return idx + 1;
  if (status === 'accepted' || status === 'pending') return 0;
  return 0;
}
