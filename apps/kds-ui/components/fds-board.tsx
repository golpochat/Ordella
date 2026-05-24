'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { updateFulfillmentStatus } from '@/lib/api';
import { loadFdsSettings, type FdsLocalSettings } from '@/lib/fds-settings';
import { useFulfillmentBoard } from '@/hooks/use-fulfillment-board';
import { FdsHeader } from '@/components/fds-header';
import { FdsOrderCard } from '@/components/fds-order-card';

const COLUMNS = [
  { id: 'NEW', label: 'New' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'READY', label: 'Ready' },
  { id: 'COMPLETED', label: 'Completed' },
] as const;

function matchesModeFilter(orderType: string, filter: FdsLocalSettings['fulfillmentModeFilter']): boolean {
  if (filter === 'all') return true;
  if (filter === 'pickup') return orderType === 'pickup';
  if (filter === 'delivery') return orderType === 'delivery';
  return orderType === 'pos' || orderType === 'dine_in' || orderType === 'in_store';
}

export function FdsBoard() {
  const [settings, setSettings] = useState<FdsLocalSettings>(() => loadFdsSettings());
  const [busyId, setBusyId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { orders, loading, error, connected, lastSync, newOrderIds, refresh, clearHighlight } =
    useFulfillmentBoard(settings.showCompleted);

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => settings.showCompleted || c.id !== 'COMPLETED'),
    [settings.showCompleted],
  );

  const columns = useMemo(() => {
    const grouped: Record<string, typeof orders> = {
      NEW: [],
      IN_PROGRESS: [],
      READY: [],
      COMPLETED: [],
    };
    for (const order of orders) {
      if (!matchesModeFilter(order.orderType, settings.fulfillmentModeFilter)) continue;
      const key = order.fulfillmentStatus;
      if (grouped[key]) grouped[key].push(order);
    }
    return grouped;
  }, [orders, settings.fulfillmentModeFilter]);

  const playNewOrderSound = useCallback(() => {
    if (!settings.soundAlerts) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/new-order.mp3');
      }
      void audioRef.current.play().catch(() => {
        /* optional asset may be missing */
      });
    } catch {
      /* ignore */
    }
  }, [settings.soundAlerts]);

  useEffect(() => {
    if (newOrderIds.size > 0) {
      playNewOrderSound();
    }
  }, [newOrderIds.size, playNewOrderSound]);

  const runAction = async (
    orderId: string,
    status: 'IN_PROGRESS' | 'READY' | 'COMPLETED',
  ) => {
    setBusyId(orderId);
    try {
      await updateFulfillmentStatus(orderId, status);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <FdsHeader
        connected={connected}
        lastSync={lastSync}
        settings={settings}
        onSettingsChange={(next) => {
          setSettings(next);
          if (next.darkMode) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }}
        onRefresh={() => void refresh()}
      />

      {error ? <p className="bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="p-6 text-muted-foreground">Loading fulfillment queue…</p>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleColumns.map((column) => (
            <section
              key={column.id}
              className="flex min-h-0 flex-col rounded-lg border bg-muted/20"
            >
              <div className="border-b px-3 py-2">
                <h2 className="font-semibold">{column.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {columns[column.id]?.length ?? 0} orders
                </p>
              </div>
              <div className="fds-column-scroll flex-1 space-y-3 overflow-y-auto p-3">
                {(columns[column.id] ?? []).map((order) => (
                  <FdsOrderCard
                    key={order.id}
                    order={order}
                    isNew={newOrderIds.has(order.id)}
                    onClearHighlight={() => clearHighlight(order.id)}
                    busy={busyId === order.id}
                    onStart={() => void runAction(order.id, 'IN_PROGRESS')}
                    onReady={() => void runAction(order.id, 'READY')}
                    onComplete={() => void runAction(order.id, 'COMPLETED')}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
