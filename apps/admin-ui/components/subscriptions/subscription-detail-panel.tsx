'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { cancelSubscription, pauseSubscription, updateSubscription, type AdminSubscription } from '@/lib/api/admin/subscriptions';
import { formatDate, formatMoney } from '@/lib/utils';

export function SubscriptionDetailPanel({ initialSubscription }: { initialSubscription: AdminSubscription }) {
  const [subscription, setSubscription] = useState(initialSubscription);

  async function setSchedule(schedule: string) {
    setSubscription(await updateSubscription(createBrowserApiClient(), subscription.id, { schedule }));
  }

  async function pause() {
    setSubscription(await pauseSubscription(createBrowserApiClient(), subscription.id));
  }

  async function cancel() {
    setSubscription(await cancelSubscription(createBrowserApiClient(), subscription.id));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{subscription.customer?.name ?? 'Subscription'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="Schedule" value={subscription.schedule} />
            <Metric title="Next run" value={formatDate(subscription.nextRunAt)} />
            <Metric title="Status" value={subscription.status} />
            <Metric title="Total" value={formatMoney(subscription.totalPrice)} />
          </div>
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Payment method</p>
            <p className="text-muted-foreground">{subscription.paymentMethodId ?? 'Placeholder or not saved yet'}</p>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Delivery address</p>
            <p className="text-muted-foreground">{subscription.deliveryDetails ? JSON.stringify(subscription.deliveryDetails) : 'Pickup or no delivery address'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={subscription.schedule} onChange={(event) => void setSchedule(event.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
            <Button type="button" variant="outline" onClick={() => void pause()}>Pause</Button>
            <Button type="button" variant="destructive" onClick={() => void cancel()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {subscription.items.map((item) => (
            <div key={item.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{item.quantity}x {item.itemId}</p>
              <p className="text-muted-foreground">Variant: {item.variantId ?? 'None'}</p>
              <p className="text-muted-foreground">Modifiers: {JSON.stringify(item.modifiers)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Order history</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Failure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscription.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.runAt)}</TableCell>
                  <TableCell><Badge variant={order.status === 'success' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                  <TableCell>{order.orderId ?? 'No order'}</TableCell>
                  <TableCell>{order.failureReason ?? 'None'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
