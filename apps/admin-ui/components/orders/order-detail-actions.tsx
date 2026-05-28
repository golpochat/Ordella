'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@shared-utils';
import { Button, Card, CardContent, CardHeader, CardTitle, Select } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { resendOrderNotifications, updateOrderStatus } from '@/lib/api/admin/orders';
import { FormActions, FormField, FormLayout, Input } from '@/components/ui/admin-form';
import { getErrorMessage } from '@/lib/utils';

const STATUSES = [
  'pending',
  'accepted',
  'picking',
  'picked',
  'preparing',
  'ready',
  'handed_to_driver',
  'out_for_delivery',
  'completed',
  'cancelled',
  'refunded',
  'failed',
];

export function OrderDetailActions({ order }: { order: Order }) {
  const { success: toastSuccess, error: toastError } = useAdminToast();

  const baseId = useId();
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [reason, setReason] = useState('');
    async function onUpdateStatus() {
    try {
      await updateOrderStatus(createBrowserApiClient(), order.id, { status, reason });
      toastSuccess('Status updated');
      router.refresh();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function onResend() {
    try {
      await resendOrderNotifications(createBrowserApiClient(), order.id);
      toastSuccess('Notifications queued');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Admin actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <FormLayout constrained={false}>
          <FormField label="Status override" htmlFor={`${baseId}-status`}>
            <Select
              id={`${baseId}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Reason" htmlFor={`${baseId}-reason`} helper="Optional note stored on the status change.">
            <Input
              id={`${baseId}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
          <FormActions className="mt-4">
            <Button type="button" onClick={onUpdateStatus}>
              Update status
            </Button>
            <Button type="button" variant="secondary" onClick={onResend}>
              Resend notifications
            </Button>
          </FormActions>
        </FormLayout>
      </CardContent>
    </Card>
  );
}
