'use client';

import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { deliveryTaskSchema } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/config';
import { getDriverAccessToken, getSession } from '@/lib/session';
import { useTasksStore } from '@/stores/tasks-store';

type TaskEventPayload = {
  taskId?: string;
  id?: string;
  tenantId?: string;
  driverId?: string | null;
  status?: string;
};

function parseTaskPayload(payload: unknown) {
  const parsed = deliveryTaskSchema.safeParse(payload);
  if (parsed.success) return parsed.data;

  const loose = payload as TaskEventPayload;
  const id = loose.id ?? loose.taskId;
  if (!id) return null;

  const existing = useTasksStore.getState().tasks.find((t) => t.id === id);
  if (!existing) return null;

  return {
    ...existing,
    status: (loose.status as typeof existing.status) ?? existing.status,
    driverId: loose.driverId ?? existing.driverId,
    tenantId: loose.tenantId ?? existing.tenantId,
  };
}

export function useDeliverySocket() {
  const upsertTask = useTasksStore((s) => s.upsertTask);
  const removeTask = useTasksStore((s) => s.removeTask);

  useEffect(() => {
    const session = getSession();
    if (!session.tenantId || !session.driverId) return;
    const accessToken = getDriverAccessToken(session);

    const baseUrl = getApiBaseUrl().replace('/api/v1', '');
    const socket: Socket = io(`${baseUrl}/deliveries`, {
      transports: ['websocket'],
      query: {
        tenantId: session.tenantId,
        driverId: session.driverId,
      },
      extraHeaders: { 'X-Tenant-Id': session.tenantId },
      auth: accessToken ? { token: accessToken } : undefined,
    });

    socket.emit('deliveries.subscribe', {
      tenantId: session.tenantId,
      driverId: session.driverId,
    });

    const onTaskEvent = (payload: unknown) => {
      const task = parseTaskPayload(payload);
      if (!task) return;
      if (task.tenantId !== session.tenantId) return;
      if (task.driverId && task.driverId !== session.driverId) return;

      if (task.status === 'cancelled') {
        removeTask(task.id);
        return;
      }

      upsertTask(task);
    };

    socket.on('task.assigned', onTaskEvent);
    socket.on('task.updated', onTaskEvent);
    socket.on('task.cancelled', onTaskEvent);

    return () => {
      socket.disconnect();
    };
  }, [removeTask, upsertTask]);
}
