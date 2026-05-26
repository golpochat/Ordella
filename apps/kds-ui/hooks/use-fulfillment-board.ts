'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  fetchFulfillmentFeed,
  type FulfillmentOrder,
  fulfillmentOrderSchema,
} from '@/lib/api';
import { bootstrapKdsRuntimeConfig, getSocketBaseUrl, getTenantId } from '@/lib/config';
import { loadFdsSettings } from '@/lib/fds-settings';

const POLL_MS = 12_000;

function mergeOrders(prev: FulfillmentOrder[], incoming: FulfillmentOrder[]): FulfillmentOrder[] {
  const map = new Map(prev.map((o) => [o.id, o]));
  for (const order of incoming) {
    map.set(order.id, order);
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function upsertOrder(prev: FulfillmentOrder[], order: FulfillmentOrder): FulfillmentOrder[] {
  const next = prev.filter((o) => o.id !== order.id);
  next.push(order);
  return next.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function useFulfillmentBoard(includeCompleted: boolean) {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      bootstrapKdsRuntimeConfig();
      const feed = await fetchFulfillmentFeed(includeCompleted);
      setOrders((prev) => mergeOrders(prev, feed));
      setError(null);
      setLastSync(new Date());

      const freshIds = new Set(feed.map((o) => o.id));
      const settings = loadFdsSettings();
      const newlyAdded = feed
        .filter((o) => !knownIds.current.has(o.id) && o.fulfillmentStatus === 'NEW')
        .map((o) => o.id);
      if (newlyAdded.length && settings.soundAlerts) {
        setNewOrderIds((s) => new Set([...s, ...newlyAdded]));
      }
      knownIds.current = freshIds;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load fulfillment feed');
    } finally {
      setLoading(false);
    }
  }, [includeCompleted]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    bootstrapKdsRuntimeConfig();
    const tenantId = getTenantId();
    if (!tenantId) return;

    const socket: Socket = io(`${getSocketBaseUrl()}/kds`, {
      transports: ['websocket'],
      query: { tenantId },
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('kds.subscribe', { tenantId });
    });
    socket.on('disconnect', () => setConnected(false));

    const onOrderEvent = (payload: unknown) => {
      const parsed = fulfillmentOrderSchema.safeParse(payload);
      if (!parsed.success) {
        void refresh();
        return;
      }
      setOrders((prev) => upsertOrder(prev, parsed.data));
      setLastSync(new Date());
      if (parsed.data.fulfillmentStatus === 'NEW') {
        const settings = loadFdsSettings();
        if (settings.soundAlerts) {
          setNewOrderIds((s) => new Set(s).add(parsed.data.id));
        }
      }
    };

    socket.on('order.created', onOrderEvent);
    socket.on('order.updated', onOrderEvent);
    socket.on('order.preparing', onOrderEvent);
    socket.on('order.ready', onOrderEvent);
    socket.on('order.completed', onOrderEvent);

    return () => {
      socket.disconnect();
    };
  }, [refresh]);

  const clearHighlight = useCallback((orderId: string) => {
    setNewOrderIds((s) => {
      const next = new Set(s);
      next.delete(orderId);
      return next;
    });
  }, []);

  return {
    orders,
    loading,
    error,
    connected,
    lastSync,
    newOrderIds,
    refresh,
    clearHighlight,
    setOrders,
  };
}
