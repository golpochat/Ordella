'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { fetchOrderStatus, type OrderStatus } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/config';
import { tokenStorage } from '@/lib/session';

export function useOrderTracking(orderId: string) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    fetchOrderStatus(orderId)
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order status'));

    const tenantId = tokenStorage.getTenantId();
    if (!tenantId) return;

    const baseUrl = getApiBaseUrl().replace('/api/v1', '');
    const socket: Socket = io(`${baseUrl}/kds`, {
      transports: ['websocket'],
      query: { tenantId },
      extraHeaders: { 'X-Tenant-Id': tenantId },
      auth: tokenStorage.getAccessToken()
        ? { token: tokenStorage.getAccessToken() }
        : undefined,
    });

    socket.emit('kds.subscribe', { tenantId });

    const onUpdate = (payload: { orderId?: string; status?: string }) => {
      if (payload.orderId !== orderId || !payload.status) return;
      setStatus((prev) =>
        prev ? { ...prev, status: payload.status as OrderStatus['status'] } : prev,
      );
    };

    socket.on('order.preparing', onUpdate);
    socket.on('order.ready', onUpdate);
    socket.on('order.out_for_delivery', onUpdate);
    socket.on('order.completed', onUpdate);
    socket.on('order.updated', onUpdate);

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return { status, error };
}
