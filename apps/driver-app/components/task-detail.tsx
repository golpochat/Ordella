'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import {
  acceptDriverOrder,
  completeDriverOrder,
  fetchAssignedOrders,
  fetchAvailableOrders,
  nextActionForOrder,
  orderTypeLabel,
  pickupCompleteDriverOrder,
  startDriverOrder,
  type DriverOrder,
} from '@/lib/driver-orders-api';
import { statusLabel } from '@/lib/delivery-status';
import { maskPhone } from '@/lib/mask-phone';
import { setActiveTaskId } from '@/lib/session';

type TaskDetailProps = {
  taskId: string;
};

export function TaskDetail({ taskId }: TaskDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assigned, available] = await Promise.all([
        fetchAssignedOrders(),
        fetchAvailableOrders(),
      ]);
      const found = [...assigned, ...available].find((o) => o.id === taskId);
      if (!found) {
        throw new Error('Order not found');
      }
      setOrder(found);
      setActiveTaskId(found.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runPrimaryAction = async () => {
    if (!order) return;
    const next = nextActionForOrder(order);
    if (!next?.action) return;

    setActionError(null);
    setBusy(true);
    try {
      let updated: DriverOrder;
      switch (next.action) {
        case 'accept':
          updated = await acceptDriverOrder(order.orderId);
          break;
        case 'start':
          updated = await startDriverOrder(order.orderId);
          break;
        case 'complete':
          updated = await completeDriverOrder(order.orderId);
          break;
        case 'pickup-complete':
          updated = await pickupCompleteDriverOrder(order.orderId);
          break;
        default:
          return;
      }
      setOrder(updated);
      if (updated.status === 'delivered' || updated.status === 'cancelled' || updated.status === 'failed') {
        setActiveTaskId(null);
        router.push('/orders');
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm text-destructive">{error ?? 'Order not found'}</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const next = nextActionForOrder(order);
  const itemsText =
    order.itemsSummary.length > 0
      ? order.itemsSummary.map((l) => `${l.quantity}× ${l.name}`).join(', ')
      : 'Items pending sync';

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Order details</h1>
          <p className="text-sm text-muted-foreground">
            {order.orderNumber ? `#${order.orderNumber}` : `Order ${order.orderId.slice(0, 8)}`}
          </p>
        </div>
        <Badge>{statusLabel(order.status)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{orderTypeLabel(order.orderType, order.isPickup)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{itemsText}</p>
          {order.notes ? <p>Notes: {order.notes}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{order.customerName}</p>
          {order.customerPhone ? <p>{maskPhone(order.customerPhone)}</p> : null}
          {order.deliveryAddress ? <p className="pt-2">{order.deliveryAddress}</p> : null}
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="flex flex-col gap-2">
        {next ? (
          <Button disabled={busy} onClick={() => void runPrimaryAction()}>
            {busy ? 'Updating…' : next.label}
          </Button>
        ) : null}

        {order.deliveryAddress ? (
          <Button asChild variant="outline">
            <Link href={`/navigation?taskId=${order.id}`}>Navigate</Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    </div>
  );
}
