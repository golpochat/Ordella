'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@shared-ui';
import { ProofOfDeliveryForm } from '@/components/proof-of-delivery-form';
import {
  formatAddress,
  updateDeliveryTask,
  type DeliveryTaskDetails,
} from '@/lib/api';
import { assertTransition, statusLabel, type DeliveryTaskStatus } from '@/lib/delivery-status';
import { maskPhone } from '@/lib/mask-phone';
import { setActiveTaskId } from '@/lib/session';
import { loadTaskDetails, useTasksStore } from '@/stores/tasks-store';

type TaskDetailProps = {
  taskId: string;
};

export function TaskDetail({ taskId }: TaskDetailProps) {
  const router = useRouter();
  const upsertTask = useTasksStore((s) => s.upsertTask);
  const [task, setTask] = useState<DeliveryTaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [podNotes, setPodNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await loadTaskDetails(taskId);
      setTask(details);
      setActiveTaskId(details.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const transition = async (to: DeliveryTaskStatus, notes?: string) => {
    if (!task) return;
    setActionError(null);

    try {
      assertTransition(task.status, to);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Invalid status change');
      return;
    }

    setBusy(true);
    try {
      const updated = await updateDeliveryTask(task.id, {
        status: to,
        notes: notes ?? (podNotes || task.notes || undefined),
      });
      const details = { ...task, ...updated };
      setTask(details);
      upsertTask(updated);
      if (to === 'delivered' || to === 'failed' || to === 'cancelled') {
        setActiveTaskId(null);
        router.push('/tasks');
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading task…</p>;
  }

  if (error || !task) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm text-destructive">{error ?? 'Task not found'}</p>
        <Button asChild variant="outline">
          <Link href="/tasks">Back to tasks</Link>
        </Button>
      </div>
    );
  }

  const dropoffAddress = formatAddress(task.dropoff) || 'Delivery address pending';
  const pickupAddress =
    formatAddress(task.pickup) ||
    [task.pickup.name].filter(Boolean).join(', ') ||
    'Pickup location pending';

  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Task details</h1>
          <p className="text-sm text-muted-foreground">
            {task.orderNumber ? `Order #${task.orderNumber}` : `Order ${task.orderId.slice(0, 8)}`}
          </p>
        </div>
        <Badge>{statusLabel(task.status)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {task.orderItems.length === 0 ? (
            <p className="text-muted-foreground">Line items will appear when synced from the order.</p>
          ) : (
            task.orderItems.map((line) => (
              <div key={`${line.name}-${line.quantity}`} className="flex justify-between">
                <span>{line.name}</span>
                <span>x{line.quantity}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pickup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{task.pickup.name ?? 'Restaurant'}</p>
          <p>{pickupAddress}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{dropoffAddress}</p>
          {task.dropoff.instructions ? <p>Instructions: {task.dropoff.instructions}</p> : null}
          <p>
            Customer: {task.customerName}
            {task.customerPhone ? ` · ${maskPhone(task.customerPhone)}` : ''}
          </p>
        </CardContent>
      </Card>

      {task.status === 'en_route' ? (
        <ProofOfDeliveryForm onNotesChange={setPodNotes} />
      ) : null}

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="flex flex-col gap-2">
        {task.status === 'pending' ? (
          <Button disabled={busy} onClick={() => void transition('assigned')}>
            Start delivery
          </Button>
        ) : null}

        {task.status === 'assigned' ? (
          <Button disabled={busy} onClick={() => void transition('en_route')}>
            Mark en route
          </Button>
        ) : null}

        {task.status === 'en_route' ? (
          <Button disabled={busy} onClick={() => void transition('delivered')}>
            Mark delivered
          </Button>
        ) : null}

        {task.status === 'assigned' || task.status === 'en_route' ? (
          <div className="space-y-2 rounded-md border p-3">
            <label htmlFor="fail-reason" className="text-sm font-medium">
              Failure reason
            </label>
            <Input
              id="fail-reason"
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              placeholder="Customer unavailable, wrong address…"
            />
            <Button
              variant="destructive"
              disabled={busy || !failReason.trim()}
              onClick={() => void transition('failed', failReason.trim())}
            >
              Mark failed
            </Button>
          </div>
        ) : null}

        <Button asChild variant="outline">
          <Link href={`/navigation?taskId=${task.id}`}>Open navigation</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/tasks">Back to tasks</Link>
        </Button>
      </div>
    </div>
  );
}
