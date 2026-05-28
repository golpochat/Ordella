'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import Link from 'next/link';
import { useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  cancelSubscription,
  pauseSubscription,
  upsertSubscriptionPlan,
  type AdminSubscription,
  type SubscriptionAnalytics,
  type SubscriptionPlan,
} from '@/lib/api/admin/subscriptions';
import { formatDate, formatMoney } from '@/lib/utils';
import { IrreversibleConfirmDialog } from '@/components/ui/admin-dialog';
import { Card as PlanCard, CardBody, Metric, MetricGrid } from '@/components/ui/admin-card';

export function SubscriptionsPanel({
  initialSubscriptions,
  analytics,
  initialPlans,
}: {
  initialSubscriptions: AdminSubscription[];
  analytics: SubscriptionAnalytics;
  initialPlans: SubscriptionPlan[];
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [plans, setPlans] = useState(initialPlans);
  const [cancelTarget, setCancelTarget] = useState<AdminSubscription | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '19.00',
    billingCycle: 'monthly',
    trialPeriod: '0',
    freeDelivery: true,
    discountPercent: '10',
    pointsMultiplier: '1.25',
    exclusiveItems: '',
  });

  async function pause(id: string) {
    const updated = await pauseSubscription(createBrowserApiClient(), id);
    setSubscriptions((current) => current.map((row) => (row.id === id ? updated : row)));
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const updated = await cancelSubscription(createBrowserApiClient(), cancelTarget.id);
      setSubscriptions((current) => current.map((row) => (row.id === cancelTarget.id ? updated : row)));
      setCancelTarget(null);
    } finally {
      setCancelLoading(false);
    }
  }

  async function savePlan() {
    const plan = await upsertSubscriptionPlan(createBrowserApiClient(), {
      name: planForm.name,
      price: Number(planForm.price),
      billingCycle: planForm.billingCycle,
      trialPeriod: Number(planForm.trialPeriod),
      perks: {
        freeDelivery: planForm.freeDelivery,
        discountPercent: Number(planForm.discountPercent),
        pointsMultiplier: Number(planForm.pointsMultiplier),
        exclusiveItems: planForm.exclusiveItems.split(',').map((item) => item.trim()).filter(Boolean),
        description: [
          planForm.freeDelivery ? 'Free delivery on eligible orders' : '',
          `${Number(planForm.discountPercent)}% subscriber discount`,
          `${Number(planForm.pointsMultiplier)}x loyalty points`,
        ].filter(Boolean),
      },
      status: 'active',
    });
    setPlans((current) => [plan, ...current.filter((row) => row.id !== plan.id)]);
    setPlanForm((current) => ({ ...current, name: '' }));
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <IrreversibleConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title={cancelTarget ? `Cancel subscription for ${cancelTarget.customer?.name ?? 'this customer'}?` : 'Cancel subscription?'}
        description="Renewals will stop and the customer will lose subscriber perks at the end of the current period."
        confirmLabel="Cancel subscription"
        loading={cancelLoading}
        onConfirm={confirmCancel}
      />
      <MetricGrid columns={4}>
        <Metric title="Active subscriptions" value={analytics.activeSubscriptions} />
        <Metric title="Subscription revenue" value={formatMoney(analytics.subscriptionRevenue)} />
        <Metric title="Membership MRR" value={formatMoney(analytics.mrr)} />
        <Metric title="Active members" value={analytics.activeMembers} />
        <Metric title="Subscriber LTV" value={formatMoney(analytics.subscriberLtv)} />
        <Metric title="Churn rate" value={`${analytics.churnRate}%`} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Membership Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Plan name" value={planForm.name} onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))} />
            <Input type="number" min="0" step="0.01" placeholder="Price" value={planForm.price} onChange={(event) => setPlanForm((current) => ({ ...current, price: event.target.value }))} />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={planForm.billingCycle} onChange={(event) => setPlanForm((current) => ({ ...current, billingCycle: event.target.value }))}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
            <Input type="number" min="0" placeholder="Trial days" value={planForm.trialPeriod} onChange={(event) => setPlanForm((current) => ({ ...current, trialPeriod: event.target.value }))} />
            <label className="flex items-center gap-2 rounded-md border border-border-default px-3 text-sm">
              <input type="checkbox" checked={planForm.freeDelivery} onChange={(event) => setPlanForm((current) => ({ ...current, freeDelivery: event.target.checked }))} />
              Free delivery
            </label>
            <Input type="number" min="0" placeholder="Discount %" value={planForm.discountPercent} onChange={(event) => setPlanForm((current) => ({ ...current, discountPercent: event.target.value }))} />
            <Input type="number" min="1" step="0.05" placeholder="Points multiplier" value={planForm.pointsMultiplier} onChange={(event) => setPlanForm((current) => ({ ...current, pointsMultiplier: event.target.value }))} />
            <Input placeholder="Exclusive item IDs, comma separated" value={planForm.exclusiveItems} onChange={(event) => setPlanForm((current) => ({ ...current, exclusiveItems: event.target.value }))} />
          </div>
          <Button type="button" onClick={() => void savePlan()} disabled={!planForm.name.trim()}>
            Create plan
          </Button>
          <MetricGrid columns={3}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} className="border-border shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <Tag variant={plan.status === 'active' ? 'brand' : 'neutral'}><TagLabel>{plan.status}</TagLabel></Tag>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatMoney(plan.price)} / {plan.billingCycle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{perksLabel(plan.perks)}</p>
                </CardBody>
              </PlanCard>
            ))}
          </MetricGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Canceled</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Churn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {analytics.planPerformance.map((plan) => (
                <TableRow key={plan.planId}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.activeSubscribers}</TableCell>
                  <TableCell>{plan.canceledSubscribers}</TableCell>
                  <TableCell>{formatMoney(plan.mrr)}</TableCell>
                  <TableCell>{plan.churnRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan / Items</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Renewal / Next run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <Link className="font-medium underline-offset-4 hover:underline" href={`/subscriptions/${subscription.id}`}>
                      {subscription.customer?.name ?? subscription.customerId.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{subscription.customer?.email ?? subscription.customer?.phone ?? 'No contact'}</p>
                  </TableCell>
                  <TableCell>{subscription.plan?.name ?? subscription.items.map((item) => `${item.quantity}x ${item.itemId.slice(0, 8)}`).join(', ')}</TableCell>
                  <TableCell>{subscription.billingCycle ?? subscription.schedule}</TableCell>
                  <TableCell>{formatDate(subscription.renewalDate ?? subscription.nextRunAt)}</TableCell>
                  <TableCell><Tag variant={subscription.status === 'active' ? 'brand' : 'neutral'}><TagLabel>{subscription.status}</TagLabel></Tag></TableCell>
                  <TableCell>{subscription.paymentMethodId ? 'Saved' : 'Needs method'}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => void pause(subscription.id)}>Pause</Button>
                    <Button size="sm" variant="error" onClick={() => setCancelTarget(subscription)}>Cancel</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

function perksLabel(perks: Record<string, unknown>) {
  const labels = [
    perks.freeDelivery ? 'free delivery' : '',
    Number(perks.discountPercent ?? 0) ? `${perks.discountPercent}% off` : '',
    Number(perks.pointsMultiplier ?? 1) > 1 ? `${perks.pointsMultiplier}x points` : '',
  ].filter(Boolean);
  return labels.length ? labels.join(' · ') : 'No perks configured';
}

