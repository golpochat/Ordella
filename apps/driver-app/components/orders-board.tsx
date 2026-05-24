'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { useDeliverySocket } from '@/hooks/use-delivery-socket';
import { OrderCard } from '@/components/order-card';
import {
  acceptDriverOrder,
  completeDriverOrder,
  fetchAssignedOrders,
  fetchAvailableOrders,
  fetchCompletedOrders,
  nextActionForOrder,
  pickupCompleteDriverOrder,
  startDriverOrder,
  type DriverOrder,
} from '@/lib/driver-orders-api';
import { useTasksStore } from '@/stores/tasks-store';
import { getSession } from '@/lib/session';

type OrdersTab = 'assigned' | 'available' | 'completed';

export function OrdersBoard() {
  const [tab, setTab] = useState<OrdersTab>('assigned');
  const [assigned, setAssigned] = useState<DriverOrder[]>([]);
  const [available, setAvailable] = useState<DriverOrder[]>([]);
  const [completed, setCompleted] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const upsertTask = useTasksStore((s) => s.upsertTask);

  useDeliverySocket();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, v, c] = await Promise.all([
        fetchAssignedOrders(),
        fetchAvailableOrders(),
        fetchCompletedOrders(),
      ]);
      setAssigned(a);
      setAvailable(v);
      setCompleted(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (order: DriverOrder) => {
    const next = nextActionForOrder(order);
    if (!next?.action) return;

    setActionBusyId(order.id);
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

      upsertTask({
        id: updated.id,
        tenantId: getTenantFromOrder(updated),
        orderId: updated.orderId,
        driverId: updated.driverId,
        status: updated.status,
        eta: updated.eta,
        startedAt: null,
        completedAt: null,
        metadata: updated.metadata,
        deliveryFee: null,
        notes: updated.notes,
        createdAt: updated.createdAt,
        updatedAt: null,
      });

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionBusyId(null);
    }
  };

  const renderList = (orders: DriverOrder[], empty: string, showActions: boolean) => {
    if (loading) {
      return <p className="text-sm text-muted-foreground">Loading orders…</p>;
    }
    if (!loading && orders.length === 0) {
      return <p className="text-sm text-muted-foreground">{empty}</p>;
    }
    return (
      <div className="space-y-3">
        {orders.map((order) => {
          const next = showActions ? nextActionForOrder(order) : null;
          return (
            <OrderCard
              key={order.id}
              order={order}
              onAction={next ? () => void runAction(order) : undefined}
              actionLabel={next?.label}
              actionBusy={actionBusyId === order.id}
              showNavigate={!order.isPickup || Boolean(order.deliveryAddress)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Delivery and business pickup runs</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as OrdersTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="assigned" className="flex-1 text-xs">
            Assigned
          </TabsTrigger>
          <TabsTrigger value="available" className="flex-1 text-xs">
            Available
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4">
          {renderList(assigned, 'No assigned orders right now.', true)}
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          {renderList(available, 'No available orders to claim.', true)}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderList(completed, 'No completed orders yet.', false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTenantFromOrder(_order: DriverOrder): string {
  return getSession().tenantId;
}
