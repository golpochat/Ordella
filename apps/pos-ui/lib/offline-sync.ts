'use client';

import {
  getOfflineBootstrap,
  syncOfflineInventory,
  syncOfflineOrders,
  type PosOfflineBootstrap,
} from '@/lib/api';
import { getSession } from '@/lib/session';
import {
  enqueueOfflineEvent,
  listInventoryAdjustments,
  listOfflineEvents,
  listPendingOfflineOrders,
  removeInventoryAdjustment,
  removeOfflineEvent,
  removeOfflineOrder,
  saveOfflineBootstrap,
  updateOfflineOrder,
  type OfflineBootstrapData,
  type OfflineEvent,
  type OfflineModeSettings,
} from '@/lib/offline-db';

export type PosSyncState = 'online' | 'offline' | 'syncing';

export type OfflineSyncSummary = {
  synced: number;
  failed: number;
  requiresReview: number;
};

function mapBootstrap(data: PosOfflineBootstrap): OfflineBootstrapData {
  return {
    categories: data.categories,
    items: data.items,
    taxes: data.taxes,
    discounts: data.discounts,
    bundles: data.bundles,
    inventory: data.inventory,
    customers: data.customers,
    staffPermissions: data.staffPermissions,
    settings: data.settings,
    syncedAt: data.syncedAt,
  };
}

export async function refreshOfflineBootstrap(): Promise<OfflineBootstrapData> {
  const session = getSession();
  const data = await getOfflineBootstrap(session.locationId || undefined);
  const mapped = mapBootstrap(data);
  await saveOfflineBootstrap(mapped);
  return mapped;
}

export async function recordConnectivityEvent(online: boolean): Promise<void> {
  await enqueueOfflineEvent({
    type: online ? 'offline_mode_deactivated' : 'offline_mode_activated',
    payload: {
      session: getSession(),
      online,
    },
  });
}

function shouldSendEvent(event: OfflineEvent): boolean {
  return event.type === 'sync_failure' || event.type === 'payment_failure';
}

export async function hasPendingOfflineWork(): Promise<boolean> {
  const [orders, adjustments] = await Promise.all([
    listPendingOfflineOrders(),
    listInventoryAdjustments(),
  ]);

  return orders.length > 0 || adjustments.length > 0;
}

export async function syncPendingOfflineWork(settings?: OfflineModeSettings): Promise<OfflineSyncSummary> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: 0, requiresReview: 0 };
  }
  if (settings && !settings.enabled) {
    return { synced: 0, failed: 0, requiresReview: 0 };
  }

  const [orders, events, adjustments] = await Promise.all([
    listPendingOfflineOrders(),
    listOfflineEvents(),
    listInventoryAdjustments(),
  ]);

  const summary: OfflineSyncSummary = { synced: 0, failed: 0, requiresReview: 0 };

  if (orders.length) {
    for (const order of orders) {
      await updateOfflineOrder(order.id, {
        status: 'syncing',
        attempts: order.attempts + 1,
      });
    }

    try {
      const result = await syncOfflineOrders({
        orders: orders.map((order) => order.payload),
        events: events.filter(shouldSendEvent),
      });

      for (const item of result.results) {
        const local = orders.find((order) => order.payload.clientOrderId === item.clientOrderId);
        if (!local) continue;

        if (item.status === 'synced') {
          await removeOfflineOrder(local.id);
          summary.synced += 1;
          continue;
        }

        if (item.status === 'requires_review') {
          await updateOfflineOrder(local.id, {
            status: 'requires_review',
            conflicts: item.conflicts,
            syncedOrderId: item.orderId,
            lastError: item.message,
          });
          summary.requiresReview += 1;
          continue;
        }

        await updateOfflineOrder(local.id, {
          status: 'failed',
          conflicts: item.conflicts,
          lastError: item.message ?? 'Offline order sync failed',
        });
        summary.failed += 1;
      }

      for (const event of events) {
        await removeOfflineEvent(event.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Offline order sync failed';
      await Promise.all(
        orders.map((order) =>
          updateOfflineOrder(order.id, {
            status: 'failed',
            lastError: message,
          }),
        ),
      );
      await enqueueOfflineEvent({ type: 'sync_failure', payload: { message } });
      summary.failed += orders.length;
    }
  }

  if (adjustments.length) {
    try {
      await syncOfflineInventory({ adjustments });
      await Promise.all(adjustments.map((adjustment) => removeInventoryAdjustment(adjustment.id)));
      await refreshOfflineBootstrap();
    } catch (error) {
      await enqueueOfflineEvent({
        type: 'sync_failure',
        payload: {
          message: error instanceof Error ? error.message : 'Inventory sync failed',
          area: 'inventory',
        },
      });
    }
  } else if (summary.synced > 0) {
    await refreshOfflineBootstrap();
  }

  return summary;
}
