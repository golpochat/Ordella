'use client';

import Link from 'next/link';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import {
  formatOrderTimestamp,
  orderTypeLabel,
  type DriverOrder,
} from '@/lib/driver-orders-api';
import { statusLabel, type DeliveryTaskStatus } from '@/lib/delivery-status';
import { maskPhone } from '@/lib/mask-phone';

type OrderCardProps = {
  order: DriverOrder;
  onAction?: (order: DriverOrder) => void;
  actionLabel?: string;
  actionBusy?: boolean;
  showNavigate?: boolean;
};

function statusVariant(
  status: DeliveryTaskStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'delivered') return 'default';
  if (status === 'failed' || status === 'cancelled') return 'destructive';
  if (status === 'en_route') return 'secondary';
  return 'outline';
}

export function OrderCard({
  order,
  onAction,
  actionLabel,
  actionBusy,
  showNavigate = true,
}: OrderCardProps) {
  const itemsText =
    order.itemsSummary.length > 0
      ? order.itemsSummary.map((l) => `${l.quantity}× ${l.name}`).join(', ')
      : 'Items pending sync';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">
            {order.orderNumber ? `#${order.orderNumber}` : `Order ${order.orderId.slice(0, 8)}`}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{formatOrderTimestamp(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{orderTypeLabel(order.orderType, order.isPickup)}</Badge>
          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="font-medium">{order.customerName}</span>
          {order.customerPhone ? (
            <span className="text-muted-foreground"> · {maskPhone(order.customerPhone)}</span>
          ) : null}
        </p>
        {order.deliveryAddress ? (
          <p className="text-muted-foreground">{order.deliveryAddress}</p>
        ) : null}
        <p className="text-muted-foreground">{itemsText}</p>
        {order.notes ? <p className="text-muted-foreground">Notes: {order.notes}</p> : null}

        <div className="flex flex-col gap-2 pt-2">
          {onAction && actionLabel ? (
            <Button disabled={actionBusy} onClick={() => onAction(order)}>
              {actionBusy ? 'Updating…' : actionLabel}
            </Button>
          ) : null}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/task/${order.id}`}>Details</Link>
            </Button>
            {showNavigate && order.deliveryAddress ? (
              <Button asChild variant="ghost" className="flex-1">
                <Link href={`/navigation?taskId=${order.id}`}>Navigate</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
