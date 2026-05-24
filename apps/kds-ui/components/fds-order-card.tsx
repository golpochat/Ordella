'use client';

import { useEffect } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import type { FulfillmentOrder } from '@/lib/api';
import { loadFdsSettings } from '@/lib/fds-settings';

type FdsOrderCardProps = {
  order: FulfillmentOrder;
  isNew: boolean;
  onClearHighlight: () => void;
  onStart: () => void;
  onReady: () => void;
  onComplete: () => void;
  busy: boolean;
};

function labelOrderType(orderType: string): string {
  switch (orderType) {
    case 'delivery':
      return 'Delivery';
    case 'pickup':
      return 'Pickup';
    case 'pos':
    case 'dine_in':
    case 'in_store':
      return 'In-store';
    default:
      return 'Online';
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function FdsOrderCard({
  order,
  isNew,
  onClearHighlight,
  onStart,
  onReady,
  onComplete,
  busy,
}: FdsOrderCardProps) {
  const settings = loadFdsSettings();

  useEffect(() => {
    if (!isNew) return;
    const t = setTimeout(onClearHighlight, 8000);
    return () => clearTimeout(t);
  }, [isNew, onClearHighlight]);

  return (
    <Card className={isNew ? 'fds-card-new border-primary shadow-md' : undefined}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            #{order.orderNumber ?? order.id.slice(0, 8)}
          </CardTitle>
          <Badge variant="outline">{labelOrderType(order.orderType)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {order.lineItems.map((line) => (
            <li key={line.id} className="rounded-md border bg-muted/30 p-2">
              <p className="font-medium">
                {line.quantity}× {line.itemName}
                {line.variantName ? ` (${line.variantName})` : ''}
              </p>
              {line.modifiers.length ? (
                <p className="text-xs text-muted-foreground">{line.modifiers.join(', ')}</p>
              ) : null}
              {line.notes ? (
                <p className="text-xs text-muted-foreground">Note: {line.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>

        {settings.showCustomerInfo && order.customerInfo ? (
          <div className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
            {order.customerInfo.name ? <p>{order.customerInfo.name}</p> : null}
            {order.customerInfo.phone ? <p>{order.customerInfo.phone}</p> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {order.fulfillmentStatus === 'NEW' ? (
            <Button type="button" className="h-11 flex-1" disabled={busy} onClick={onStart}>
              Start
            </Button>
          ) : null}
          {order.fulfillmentStatus === 'IN_PROGRESS' ? (
            <Button type="button" className="h-11 flex-1" disabled={busy} onClick={onReady}>
              Mark ready
            </Button>
          ) : null}
          {order.fulfillmentStatus === 'READY' ? (
            <Button type="button" className="h-11 flex-1" disabled={busy} onClick={onComplete}>
              Complete
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
