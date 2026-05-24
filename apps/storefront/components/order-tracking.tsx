'use client';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { useOrderTracking } from '@/hooks/use-order-tracking';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order received',
  accepted: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

export function OrderTracking({ orderId }: { orderId: string }) {
  const { status, error } = useOrderTracking(orderId);

  if (error) {
    return <p className="px-4 text-sm text-destructive">{error}</p>;
  }

  if (!status) {
    return <p className="px-4 text-muted-foreground">Loading order status…</p>;
  }

  const label = STATUS_LABELS[status.status] ?? status.status;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Order {status.orderNumber ?? status.orderId.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span>Status</span>
            <Badge>{label}</Badge>
          </div>
          <p>Payment: {status.paymentStatus}</p>
          <p>Type: {status.orderType}</p>
          <p>Total: ${status.total}</p>
          <p className="text-muted-foreground">Placed: {new Date(status.createdAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
