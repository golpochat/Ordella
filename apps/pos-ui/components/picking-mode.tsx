'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@shared-ui';
import {
  completePickingTask,
  createPickingTask,
  listPickingOrders,
  listRoutingDecisions,
  rescoreRouting,
  type PickingOrder,
  type PickingTask,
  type PosRoutingDecision,
} from '@/lib/api';
import { getSession } from '@/lib/session';

export function PickingMode() {
  const [orders, setOrders] = useState<PickingOrder[]>([]);
  const [tasks, setTasks] = useState<PickingTask[]>([]);
  const [routingDecisions, setRoutingDecisions] = useState<PosRoutingDecision[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { locationId } = getSession();

  const load = useCallback(async () => {
    try {
      const nextOrders = await listPickingOrders(locationId || undefined);
      const nextDecisions = await listRoutingDecisions(locationId || undefined).catch(() => []);
      setOrders(nextOrders);
      setTasks(nextOrders.map((order) => order.pickTask).filter(Boolean) as PickingTask[]);
      setRoutingDecisions(nextDecisions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load picking queue');
    }
  }, [locationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Picking action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Picking Mode</h1>
          <p className="text-sm text-muted-foreground">Dark-store and micro-fulfillment order picking.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()}>Refresh</Button>
      </div>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Pending orders" value={orders.filter((order) => !order.pickTask || order.pickTask.status !== 'completed').length} />
        <Metric label="Active tasks" value={tasks.filter((task) => task.status !== 'completed').length} />
        <Metric label="Batches" value={new Set(tasks.map((task) => task.batchId).filter(Boolean)).size} />
      </div>

      <div className="mt-5 space-y-3">
        {orders.map((order) => {
          const routingDecision = routingDecisions.find((decision) => decision.orderId === order.id);
          return (
          <div key={order.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Order {order.orderNumber ?? order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{order.itemCount} items · {order.status}</p>
                <p className="text-sm text-muted-foreground">
                  Fulfilled by: {routingDecision?.toLocation?.name ?? order.locationId.slice(0, 8)}
                  {routingDecision?.estimatedDeliveryMinutes ? ` · ETA ${routingDecision.estimatedDeliveryMinutes} min` : ''}
                </p>
                {routingDecision?.reason ? <p className="text-xs text-muted-foreground">{routingDecision.reason}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => run(() => rescoreRouting(order.id, order.locationId).then(() => undefined))}
                >
                  Re-score route
                </Button>
                {!order.pickTask ? (
                  <Button disabled={loading} onClick={() => run(() => createPickingTask(order.id, locationId || undefined).then(() => undefined))}>
                    Start pick
                  </Button>
                ) : (
                  <Button disabled={loading || order.pickTask.status === 'completed'} onClick={() => run(() => completePickingTask(order.pickTask!.id).then(() => undefined))}>
                    Mark picked
                  </Button>
                )}
              </div>
            </div>
            {order.pickTask?.lines.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {order.pickTask.lines.map((line) => (
                  <div key={`${order.id}-${line.productId}`} className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium">{line.quantity}x item {line.productId.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{line.zoneName ?? 'No zone'} · {line.binCode ?? 'No bin'}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          );
        })}
        {orders.length === 0 ? <p className="text-sm text-muted-foreground">No dark-store orders are ready for picking.</p> : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
