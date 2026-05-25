'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { useOrderTracking } from '@/hooks/use-order-tracking';
import { fetchCustomerOrder, type CustomerOrderDetail } from '@/lib/api';
import { labelOrderStatus } from '@shared-utils';
import { ORDER_TIMELINE, timelineIndexForStatus } from '@/lib/order-timeline';
import { setLastOrderId } from '@/lib/session';

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { status: liveStatus, error: trackError } = useOrderTracking(orderId);

  useEffect(() => {
    void fetchCustomerOrder(orderId)
      .then((data) => {
        setOrder(data);
        setLastOrderId(data.id);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load order'));
  }, [orderId]);

  const currentStatus = liveStatus?.status ?? order?.status ?? 'pending';
  const progress = timelineIndexForStatus(currentStatus);

  if (loadError) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  if (!order && !liveStatus) {
    return <p className="p-4 text-sm text-muted-foreground">Loading order…</p>;
  }

  const label = labelOrderStatus(currentStatus);

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Order {order?.orderNumber ?? liveStatus?.orderNumber ?? orderId.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">Live order tracking</p>
        </div>
        <Badge>{label}</Badge>
      </div>

      {trackError ? <p className="text-sm text-destructive">{trackError}</p> : null}

      {liveStatus?.driverStatusLabel || liveStatus?.driverName ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {liveStatus.driverStatusLabel ? (
              <p className="font-medium">{liveStatus.driverStatusLabel}</p>
            ) : null}
            {liveStatus.driverName ? (
              <p className="text-muted-foreground">Driver: {liveStatus.driverName}</p>
            ) : null}
            {liveStatus.deliveryConfirmed ? (
              <p className="text-muted-foreground">Your order has been delivered.</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {ORDER_TIMELINE.map((step, index) => {
              const done = progress > index;
              const active = progress === index + 1;
              return (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      done || active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={done || active ? 'font-medium' : 'text-muted-foreground'}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {order ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.items?.length ? (
              order.items.map((line) => (
                <div key={line.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span>
                      {line.name} x{line.quantity}
                    </span>
                    <span>${line.price}</span>
                  </div>
                  {line.variantName ? (
                    <p className="text-xs text-muted-foreground">Variant: {line.variantName}</p>
                  ) : null}
                  {line.notes ? <p className="text-xs text-muted-foreground">{line.notes}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Line items will appear when synced.</p>
            )}
            {order.subtotal ? <p className="border-t pt-2">Subtotal: ${order.subtotal}</p> : null}
            {order.tax ? <p>Tax: ${order.tax}</p> : null}
            <p className="border-t pt-2 font-medium">Total: ${order.total}</p>
            {order.delivery ? (
              <p className="text-muted-foreground">
                Deliver to: {order.delivery.addressLine1}, {order.delivery.city}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {order?.statusTimeline?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {order.statusTimeline.map((step, index) => (
              <p key={`${step.status}-${step.changedAt}-${index}`}>
                {labelOrderStatus(step.status)} · {new Date(step.changedAt).toLocaleString()}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="outline">
        <Link href="/orders">Back to orders</Link>
      </Button>
    </div>
  );
}
