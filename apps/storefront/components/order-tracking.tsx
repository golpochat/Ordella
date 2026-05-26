'use client';

import { labelOrderStatus, labelOrderType } from '@shared-utils';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { useOrderTracking } from '@/hooks/use-order-tracking';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

export function OrderTracking({ orderId }: { orderId: string }) {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  const { status, error } = useOrderTracking(orderId);

  if (error) {
    return <p className="px-[var(--theme-spacing)] text-sm text-destructive">{error}</p>;
  }

  if (!status) {
    return <p className="px-[var(--theme-spacing)] text-muted-foreground">Loading order status…</p>;
  }

  const label = labelOrderStatus(status.status);

  return (
    <div className="mx-auto max-w-xl px-[var(--theme-spacing)] py-[var(--storefront-section-padding)]">
      <Card className="overflow-hidden rounded-[var(--storefront-radius)]">
        <div className="bg-primary px-[var(--storefront-card-padding)] py-4 text-primary-foreground">
          <p className="text-sm opacity-80">Order tracking</p>
          <h1 className="text-2xl font-bold">{status.orderNumber ?? status.orderId.slice(0, 8)}</h1>
        </div>
        <CardHeader>
          <CardTitle>Order {status.orderNumber ?? status.orderId.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span>Status</span>
            <Badge>{label}</Badge>
          </div>
          <p>Payment: {status.paymentStatus}</p>
          <p>Type: {labelOrderType(status.orderType)}</p>
          <p>Total: {formatCurrency(status.total)}</p>
          <p className="text-muted-foreground">
            Fulfilled by: {status.fulfilledByLocationName ?? 'assigned location'}
            {status.estimatedDeliveryMinutes ? ` · ETA ${status.estimatedDeliveryMinutes} min` : ''}
          </p>
          {status.routingReason ? <p className="text-muted-foreground">{status.routingReason}</p> : null}
          <p className="text-muted-foreground">Placed: {formatDateTime(status.createdAt)}</p>
          <Button asChild variant="outline" className="mt-2 h-11 w-full rounded-[var(--storefront-radius)]">
            <a href={`/order/${orderId}`}>Refresh status</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
