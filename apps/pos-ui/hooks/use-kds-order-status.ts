'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

type OrderStatusUpdate = {
  orderId: string;
  status: string;
};

export function useKdsOrderStatus(orderId?: string) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const tenantId = localStorage.getItem('ordella.tenantId');
    if (!tenantId) return;

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1').replace('/api/v1', '');
    const socket: Socket = io(`${baseUrl}/kds`, {
      transports: ['websocket'],
      query: { tenantId },
      extraHeaders: {
        'X-Tenant-Id': tenantId,
      },
    });

    const handler = (payload: OrderStatusUpdate) => {
      if (payload.orderId === orderId && payload.status) {
        setStatus(payload.status);
      }
    };

    socket.on('order.preparing', handler);
    socket.on('order.ready', handler);
    socket.on('order.completed', handler);
    socket.on('order.updated', handler);

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return status;
}
