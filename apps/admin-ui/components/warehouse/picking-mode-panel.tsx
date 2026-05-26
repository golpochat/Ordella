'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  completeDarkStorePickTask,
  createDarkStorePickTask,
  createPickWave,
  listDarkStoreOrders,
  listFulfillmentSlots,
  listPickTasks,
  type DarkStoreOrder,
  type FulfillmentSlot,
  type PickTask,
} from '@/lib/api/admin/warehouse';
import { getErrorMessage } from '@/lib/utils';

export function PickingModePanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [orders, setOrders] = useState<DarkStoreOrder[]>([]);
  const [tasks, setTasks] = useState<PickTask[]>([]);
  const [slots, setSlots] = useState<FulfillmentSlot[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [waveAutoGenerate, setWaveAutoGenerate] = useState(true);
  const [waveFrom, setWaveFrom] = useState('');
  const [waveTo, setWaveTo] = useState('');
  const [lineConfirmations, setLineConfirmations] = useState<Record<string, Record<string, { quantityPicked: string; substituteProductId: string }>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const nextLocations = await fetchLocations();
      const darkLocations = nextLocations.filter((location) =>
        ['dark_store', 'micro_fulfillment'].includes(location.fulfillmentMode ?? '') ||
        ['dark_store', 'warehouse', 'distribution_center'].includes(location.locationType ?? ''),
      );
      const locationId = selectedLocationId || darkLocations[0]?.id || '';
      const [nextOrders, nextTasks, nextSlots] = await Promise.all([
        listDarkStoreOrders(api, locationId ? { locationId } : undefined),
        listPickTasks(api),
        listFulfillmentSlots(api, locationId ? { locationId } : undefined),
      ]);
      setLocations(darkLocations);
      setSelectedLocationId(locationId);
      setOrders(nextOrders);
      setTasks(nextTasks.filter((task) => !locationId || task.warehouseId === locationId));
      setSlots(nextSlots);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api, selectedLocationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'picked');
  const activeTasks = tasks.filter((task) => task.status === 'picking');
  const pendingOrders = orders.filter((order) => !order.pickTask || !['picked', 'completed'].includes(order.pickTask.status));
  const zones = new Set(openTasks.flatMap((task) => task.lines?.map((line) => line.zoneName).filter(Boolean) ?? []));

  const setLineConfirmation = (taskId: string, productId: string, field: 'quantityPicked' | 'substituteProductId', value: string) => {
    setLineConfirmations((current) => ({
      ...current,
      [taskId]: {
        ...(current[taskId] ?? {}),
        [productId]: {
          quantityPicked: current[taskId]?.[productId]?.quantityPicked ?? '',
          substituteProductId: current[taskId]?.[productId]?.substituteProductId ?? '',
          [field]: value,
        },
      },
    }));
  };

  const confirmationLines = (task: PickTask) => (task.lines ?? []).map((line) => {
    const draft = lineConfirmations[task.id]?.[line.productId];
    return {
      productId: line.productId,
      quantityPicked: Number(draft?.quantityPicked || line.quantity),
      ...(draft?.substituteProductId ? { substituteProductId: draft.substituteProductId } : {}),
    };
  });

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Picking Mode</h2>
          <p className="text-sm text-muted-foreground">Batch, wave, and zone picking for dark stores and micro-fulfillment locations.</p>
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={selectedLocationId}
          onChange={(event) => setSelectedLocationId(event.target.value)}
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Pending orders" value={pendingOrders.length} />
        <Metric label="Active pick tasks" value={activeTasks.length} />
        <Metric label="Open waves" value={new Set(openTasks.map((task) => task.waveId).filter(Boolean)).size} />
        <Metric label="Zones" value={zones.size} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Pending dark-store orders</h3>
              <p className="text-sm text-muted-foreground">Create pick tasks from accepted/preparing online orders routed to this location.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={waveAutoGenerate}
                  onChange={(event) => setWaveAutoGenerate(event.target.checked)}
                />
                Auto-generate
              </label>
              <input
                className="h-10 rounded-md border bg-background px-3 text-sm"
                type="datetime-local"
                value={waveFrom}
                onChange={(event) => setWaveFrom(event.target.value)}
              />
              <input
                className="h-10 rounded-md border bg-background px-3 text-sm"
                type="datetime-local"
                value={waveTo}
                onChange={(event) => setWaveTo(event.target.value)}
              />
              <Button
                type="button"
                disabled={loading || !selectedLocationId || (!waveAutoGenerate && openTasks.length === 0)}
                onClick={() => run(async () => {
                  await createPickWave(api, {
                    locationId: selectedLocationId,
                    autoGenerate: waveAutoGenerate,
                    from: waveFrom ? new Date(waveFrom).toISOString() : undefined,
                    to: waveTo ? new Date(waveTo).toISOString() : undefined,
                    pickTaskIds: waveAutoGenerate ? undefined : openTasks.map((task) => task.id),
                  });
                })}
              >
                Create wave
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Order {order.orderNumber ?? order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.itemCount} items · {order.total}</p>
                  </div>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <Button
                  type="button"
                  className="mt-3 h-10 w-full"
                  disabled={loading || Boolean(order.pickTask)}
                  onClick={() => run(async () => {
                    await createDarkStorePickTask(api, {
                      orderId: order.id,
                      locationId: selectedLocationId || order.locationId,
                    });
                  })}
                >
                  {order.pickTask ? 'Pick task created' : 'Create pick task'}
                </Button>
              </div>
            ))}
            {pendingOrders.length === 0 ? <p className="text-sm text-muted-foreground">No pending dark-store orders.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h3 className="text-lg font-semibold">Pick task view</h3>
          <div className="space-y-3">
            {openTasks.map((task) => (
              <div key={task.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Task {task.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.orderId ? `Order ${task.orderId.slice(0, 8)}` : 'Manual'} · priority {task.priority ?? 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{task.status}</Badge>
                    {task.batchId ? <Badge variant="outline">Batch {task.batchId.slice(0, 8)}</Badge> : null}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {(task.lines ?? []).map((line) => (
                    <div key={`${task.id}-${line.productId}`} className="rounded-md bg-muted/40 p-2 text-sm">
                      <p className="font-medium">{line.quantity}x {line.productName ?? line.productId.slice(0, 8)}</p>
                      <p className="text-muted-foreground">{line.zoneName ?? 'No zone'} · {line.binCode ?? 'No bin'}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          className="h-9 rounded-md border bg-background px-2 text-sm"
                          type="number"
                          min="0"
                          placeholder="Quantity picked"
                          value={lineConfirmations[task.id]?.[line.productId]?.quantityPicked ?? String(line.quantity)}
                          onChange={(event) => setLineConfirmation(task.id, line.productId, 'quantityPicked', event.target.value)}
                        />
                        <input
                          className="h-9 rounded-md border bg-background px-2 text-sm"
                          placeholder="Substitute product ID"
                          value={lineConfirmations[task.id]?.[line.productId]?.substituteProductId ?? ''}
                          onChange={(event) => setLineConfirmation(task.id, line.productId, 'substituteProductId', event.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  {(task.lines ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No item details available.</p> : null}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button type="button" disabled={loading} onClick={() => run(() => completeDarkStorePickTask(api, task.id, confirmationLines(task)).then(() => undefined))}>
                    Mark picked
                  </Button>
                  <Button type="button" variant="outline" disabled={loading} onClick={() => run(() => completeDarkStorePickTask(api, task.id, undefined, (task.lines ?? []).map((line) => line.productId)).then(() => undefined))}>
                    Flag missing
                  </Button>
                </div>
              </div>
            ))}
            {openTasks.length === 0 ? <p className="text-sm text-muted-foreground">No active pick tasks.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-lg font-semibold">Fulfillment slots</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {slots.slice(0, 6).map((slot) => (
              <div key={slot.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {slot.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-muted-foreground">Capacity {slot.capacity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
