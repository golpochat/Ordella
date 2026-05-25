'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import {
  cancelCustomerSubscription,
  fetchCustomerSubscriptions,
  pauseCustomerSubscription,
  updateCustomerSubscription,
  type CustomerSubscription,
} from '@/lib/api';

export function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setSubscriptions(await fetchCustomerSubscriptions());
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

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage your recurring orders.</p>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <CardTitle className="text-base">Recurring order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2">
              <p>Schedule: {subscription.schedule}</p>
              <p>Next delivery date: {new Date(subscription.nextRunAt).toLocaleDateString()}</p>
              <p>Status: {subscription.status}</p>
              <p>Total: {subscription.totalPrice}</p>
              <p>Items: {subscription.items.map((item) => `${item.quantity}x ${item.itemId.slice(0, 8)}`).join(', ')}</p>
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={subscription.schedule}
              onChange={(event) => void changeSchedule(subscription, event.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => void pause(subscription.id)}>
                Pause
              </Button>
              <Button type="button" variant="destructive" onClick={() => void cancel(subscription.id)}>
                Cancel
              </Button>
            </div>
            {subscription.orders.length ? (
              <div className="border-t pt-3">
                <p className="font-medium">Past subscription orders</p>
                {subscription.orders.map((order) => (
                  <p key={order.id} className="text-muted-foreground">
                    {new Date(order.runAt).toLocaleDateString()} · {order.status}
                  </p>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {!subscriptions.length ? <p className="text-sm text-muted-foreground">No subscriptions yet.</p> : null}
    </div>
  );
}
