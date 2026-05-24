'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@shared-utils';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { resendOrderNotifications, updateOrderStatus } from '@/lib/api/admin/orders';
import { getErrorMessage } from '@/lib/utils';

const STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
  'refunded',
  'failed',
];

export function OrderDetailActions({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onUpdateStatus() {
    setError(null);
    setMessage(null);
    try {
      await updateOrderStatus(createBrowserApiClient(), order.id, { status, reason });
      setMessage('Status updated');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onResend() {
    setError(null);
    setMessage(null);
    try {
      await resendOrderNotifications(createBrowserApiClient(), order.id);
      setMessage('Notifications queued');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Admin actions</h3>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="order-status">
            Status override
          </label>
          <select
            id="order-status"
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Order['status'])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={onUpdateStatus}>Update status</Button>
        <Button variant="secondary" onClick={onResend}>
          Resend notifications
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
