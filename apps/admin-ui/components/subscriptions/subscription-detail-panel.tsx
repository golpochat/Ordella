'use client';

import { useId, useState } from 'react';
import { Button, Select } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  cancelSubscription,
  pauseSubscription,
  updateSubscription,
  type AdminSubscription,
} from '@/lib/api/admin/subscriptions';
import {
  DetailField,
  DetailMetric,
  DetailMetrics,
  DetailSectionCard,
  DetailStatusBadge,
  DetailTwoColumn,
  Stack,
} from '@/components/ui/admin-detail';
import { FormActions, FormField } from '@/components/ui/admin-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { formatDate, formatMoney } from '@/lib/utils';
import { IrreversibleConfirmDialog } from '@/components/ui/admin-dialog';

export function SubscriptionDetailPanel({ initialSubscription }: { initialSubscription: AdminSubscription }) {
  const scheduleId = useId();
  const [subscription, setSubscription] = useState(initialSubscription);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  async function setSchedule(schedule: string) {
    setSubscription(await updateSubscription(createBrowserApiClient(), subscription.id, { schedule }));
  }

  async function pause() {
    setSubscription(await pauseSubscription(createBrowserApiClient(), subscription.id));
  }

  async function confirmCancel() {
    setCancelLoading(true);
    try {
      setSubscription(await cancelSubscription(createBrowserApiClient(), subscription.id));
      setCancelOpen(false);
    } finally {
      setCancelLoading(false);
    }
  }

  const scheduleLabel = subscription.plan ? 'Billing cycle' : 'Schedule';
  const nextLabel = subscription.plan ? 'Renewal date' : 'Next run';

  return (
    <Stack gap="lg">
      <IrreversibleConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this subscription?"
        description="Renewals will stop and the customer will lose subscriber perks at the end of the current period."
        confirmLabel="Cancel subscription"
        loading={cancelLoading}
        onConfirm={confirmCancel}
      />
      <DetailMetrics>
        <DetailMetric
          label={scheduleLabel}
          value={subscription.billingCycle ?? subscription.schedule ?? 'Membership'}
        />
        <DetailMetric
          label={nextLabel}
          value={formatDate(subscription.renewalDate ?? subscription.nextRunAt)}
        />
        <DetailMetric
          label="Status"
          value={<DetailStatusBadge status={subscription.status} />}
        />
        <DetailMetric label="Total" value={formatMoney(subscription.totalPrice)} />
      </DetailMetrics>

      <DetailTwoColumn
        primary={
          <>
            {subscription.plan ? (
              <DetailSectionCard title="Plan" description="Membership plan and perks.">
                <Stack gap="sm">
                  <p className="text-sm font-medium text-foreground">{subscription.plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(subscription.plan.price)} / {subscription.plan.billingCycle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Perks: {JSON.stringify(subscription.plan.perks)}
                  </p>
                </Stack>
              </DetailSectionCard>
            ) : null}
            <DetailSectionCard title="Items" description="Products included in this subscription.">
              <Stack gap="sm">
                {subscription.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {item.quantity}x {item.itemId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Variant: {item.variantId ?? 'None'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modifiers: {JSON.stringify(item.modifiers)}
                    </p>
                  </div>
                ))}
              </Stack>
            </DetailSectionCard>
          </>
        }
        secondary={
          <>
            <DetailSectionCard title="Payment method">
              <DetailField
                label="Saved method"
                value={subscription.paymentMethodId ?? 'Placeholder or not saved yet'}
              />
            </DetailSectionCard>
            <DetailSectionCard title="Delivery">
              <DetailField
                label="Address"
                value={
                  subscription.deliveryDetails
                    ? JSON.stringify(subscription.deliveryDetails)
                    : 'Pickup or no delivery address'
                }
              />
            </DetailSectionCard>
            <DetailSectionCard title="Actions" description="Pause, reschedule, or cancel this subscription.">
              {!subscription.plan ? (
                <FormField label="Schedule" htmlFor={scheduleId} className="mb-4">
                  <Select
                    id={scheduleId}
                    value={subscription.schedule ?? 'monthly'}
                    onChange={(event) => void setSchedule(event.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FormField>
              ) : null}
              <FormActions className="mt-0">
                {!subscription.plan ? (
                  <Button type="button" variant="outline" onClick={() => void pause()}>
                    Pause
                  </Button>
                ) : null}
                <Button type="button" variant="error" onClick={() => setCancelOpen(true)}>
                  Cancel
                </Button>
              </FormActions>
            </DetailSectionCard>
          </>
        }
      />

      <DetailSectionCard title="Order history" description="Past subscription runs and outcomes.">
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Run date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Failure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {subscription.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-muted-foreground">{formatDate(order.runAt)}</TableCell>
                <TableCell>
                  <DetailStatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.orderId ?? 'No order'}</TableCell>
                <TableCell>{order.failureReason ?? 'None'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailSectionCard>
    </Stack>
  );
}
