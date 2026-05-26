'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import {
  cancelCustomerSubscription,
  fetchCustomerSubscriptions,
  fetchSubscriptionPlans,
  pauseCustomerSubscription,
  subscribeToPlan,
  updateCustomerSubscription,
  type CustomerSubscription,
  type SubscriptionPlan,
} from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

export function SubscriptionsView() {
  const { formatCurrency, formatDate } = useTenantSettings();
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [subscriptionRows, planRows] = await Promise.all([
      fetchCustomerSubscriptions(),
      fetchSubscriptionPlans(),
    ]);
    setSubscriptions(subscriptionRows);
    setPlans(planRows);
  }

  useEffect(() => {
    void load().catch(() => setMessage('Could not load subscriptions'));
  }, []);

  async function changeSchedule(subscription: CustomerSubscription, schedule: string) {
    await updateCustomerSubscription(subscription.id, { schedule });
    await load();
  }

  async function pause(subscriptionId: string) {
    await pauseCustomerSubscription(subscriptionId);
    await load();
  }

  async function cancel(subscriptionId: string) {
    await cancelCustomerSubscription(subscriptionId);
    await load();
  }

  async function subscribe(planId: string) {
    await subscribeToPlan(planId, { paymentMethodId: paymentMethod || undefined });
    setMessage('Membership started. You can cancel before renewal from this page.');
    await load();
  }

  async function updatePayment(subscriptionId: string) {
    await updateCustomerSubscription(subscriptionId, { paymentMethod: paymentMethod || undefined });
    setMessage('Payment method updated.');
    await load();
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions & Memberships</h1>
        <p className="text-sm text-muted-foreground">Browse membership perks and manage recurring orders.</p>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membership Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Payment method token"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">Use your saved card token or leave blank when payment setup is handled by checkout.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{plan.name}</p>
                  <p>{formatCurrency(plan.price)} / {plan.billingCycle}</p>
                </div>
                {plan.trialPeriod ? <p className="text-xs text-muted-foreground">{plan.trialPeriod} day trial</p> : null}
                <p className="mt-2 text-muted-foreground">{perksLabel(plan.perks)}</p>
                <Button className="mt-3 w-full" type="button" onClick={() => void subscribe(plan.id)}>
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
          {!plans.length ? <p className="text-muted-foreground">No membership plans are available yet.</p> : null}
        </CardContent>
      </Card>
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <CardTitle className="text-base">{subscription.plan?.name ?? 'Recurring order'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2">
              <p>Schedule: {subscription.billingCycle ?? subscription.schedule}</p>
              <p>{subscription.plan ? 'Renewal date' : 'Next delivery date'}: {formatDate(subscription.renewalDate ?? subscription.nextRunAt)}</p>
              <p>Status: {subscription.status}</p>
              <p>Total: {formatCurrency(subscription.totalPrice)}</p>
              {subscription.plan ? <p>Perks: {perksLabel(subscription.plan.perks)}</p> : <p>Items: {subscription.items.map((item) => `${item.quantity}x ${item.itemId.slice(0, 8)}`).join(', ')}</p>}
              {subscription.cancelAtPeriodEnd ? <p className="text-muted-foreground">Cancellation is scheduled for the current renewal period.</p> : null}
            </div>
            {!subscription.plan ? (
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={subscription.schedule ?? 'monthly'}
                onChange={(event) => void changeSchedule(subscription, event.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            ) : null}
            <div className="flex gap-2">
              {subscription.plan ? (
                <Button type="button" variant="outline" onClick={() => void updatePayment(subscription.id)}>
                  Update payment
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => void pause(subscription.id)}>
                  Pause
                </Button>
              )}
              <Button type="button" variant="destructive" onClick={() => void cancel(subscription.id)}>
                Cancel
              </Button>
            </div>
            {subscription.orders.length ? (
              <div className="border-t pt-3">
                <p className="font-medium">Past subscription orders</p>
                {subscription.orders.map((order) => (
                  <p key={order.id} className="text-muted-foreground">
                    {formatDate(order.runAt)} · {order.status}
                  </p>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {!subscriptions.length ? <p className="text-sm text-muted-foreground">No active subscriptions or memberships yet.</p> : null}
    </div>
  );
}

function perksLabel(perks: Record<string, unknown>) {
  const labels = [
    perks.freeDelivery ? 'free delivery' : '',
    Number(perks.discountPercent ?? 0) ? `${perks.discountPercent}% off` : '',
    Number(perks.pointsMultiplier ?? 1) > 1 ? `${perks.pointsMultiplier}x points` : '',
  ].filter(Boolean);
  return labels.length ? labels.join(' · ') : 'Standard membership benefits';
}
