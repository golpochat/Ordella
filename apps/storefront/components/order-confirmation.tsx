'use client';

import Link from 'next/link';
import { labelOrderStatus, labelOrderType } from '@shared-utils';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { useOrderTracking } from '@/hooks/use-order-tracking';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { getOpeningHours } from '@/lib/config';
import { RecommendationSection } from '@/components/recommendation-section';

type OrderConfirmationProps = {
  orderId: string;
  justPlaced?: boolean;
};

export function OrderConfirmation({ orderId, justPlaced }: OrderConfirmationProps) {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  const { status, error } = useOrderTracking(orderId);

  if (error) {
    return <p className="px-[var(--theme-spacing)] text-sm text-destructive">{error}</p>;
  }

  if (!status) {
    return <p className="px-[var(--theme-spacing)] text-muted-foreground">Loading order…</p>;
  }

  const pickupOrDelivery =
    status.orderType === 'delivery'
      ? 'We will deliver to the address you provided.'
      : status.orderType === 'pickup'
        ? 'Pick up your order at the location when it is ready.'
        : 'Visit the business to collect your in-store order.';

  return (
    <div className="mx-auto max-w-xl space-y-6 px-[var(--theme-spacing)] py-[var(--storefront-section-padding)]">
      {justPlaced ? (
        <p className="mb-4 rounded-[var(--storefront-radius)] bg-muted p-4 text-center text-lg font-medium text-primary">
          Thank you — your order was placed successfully.
        </p>
      ) : null}
      <Card className="rounded-[var(--storefront-radius)]">
        <CardHeader>
          <CardTitle>Order {status.orderNumber ?? status.orderId.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Status</span>
            <Badge>{labelOrderStatus(status.status)}</Badge>
          </div>
          <p>Payment: {status.paymentStatus}</p>
          <p>Order type: {labelOrderType(status.orderType)}</p>
          <p className="text-lg font-semibold">Total: {formatCurrency(status.total)}</p>
          <p className="text-muted-foreground">
            Fulfilled by: {status.fulfilledByLocationName ?? 'assigned location'}
            {status.estimatedDeliveryMinutes ? ` · ETA ${status.estimatedDeliveryMinutes} min` : ''}
          </p>
          {status.routingReason ? <p className="text-muted-foreground">{status.routingReason}</p> : null}
          <p className="text-muted-foreground">{pickupOrDelivery}</p>
          <p className="text-muted-foreground">Hours: {getOpeningHours()}</p>
          <p className="text-muted-foreground">
            Placed: {formatDateTime(status.createdAt)}
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild variant="outline" className="h-11 flex-1 rounded-[var(--storefront-radius)]">
              <Link href={`/order/${orderId}`}>Track order</Link>
            </Button>
            <Button asChild className="h-11 flex-1 rounded-[var(--storefront-radius)]">
              <Link href="/catalog">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <RecommendationSection
        title="You might also like"
        source="post_purchase_you_might_also_like"
        mode="cart"
      />
    </div>
  );
}
