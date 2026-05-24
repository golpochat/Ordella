'use client';

import Link from 'next/link';
import { labelOrderStatus, labelOrderType } from '@shared-utils';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { useOrderTracking } from '@/hooks/use-order-tracking';
import { getOpeningHours } from '@/lib/config';

type OrderConfirmationProps = {
  orderId: string;
  justPlaced?: boolean;
};

export function OrderConfirmation({ orderId, justPlaced }: OrderConfirmationProps) {
  const { status, error } = useOrderTracking(orderId);

  if (error) {
    return <p className="px-4 text-sm text-destructive">{error}</p>;
  }

  if (!status) {
    return <p className="px-4 text-muted-foreground">Loading order…</p>;
  }

  const pickupOrDelivery =
    status.orderType === 'delivery'
      ? 'We will deliver to the address you provided.'
      : status.orderType === 'pickup'
        ? 'Pick up your order at the location when it is ready.'
        : 'Visit the business to collect your in-store order.';

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {justPlaced ? (
        <p className="mb-4 text-center text-lg font-medium text-emerald-700">
          Thank you — your order was placed successfully.
        </p>
      ) : null}
      <Card>
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
          <p className="text-lg font-semibold">Total: ${status.total}</p>
          <p className="text-muted-foreground">{pickupOrDelivery}</p>
          <p className="text-muted-foreground">Hours: {getOpeningHours()}</p>
          <p className="text-muted-foreground">
            Placed: {new Date(status.createdAt).toLocaleString()}
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link href={`/order/${orderId}`}>Track order</Link>
            </Button>
            <Button asChild className="h-11 flex-1">
              <Link href="/catalog">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
