'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { cancelSubscription, pauseSubscription, type AdminSubscription, type SubscriptionAnalytics } from '@/lib/api/admin/subscriptions';
import { formatDate, formatMoney } from '@/lib/utils';

export function SubscriptionsPanel({
  initialSubscriptions,
  analytics,
}: {
  initialSubscriptions: AdminSubscription[];
  analytics: SubscriptionAnalytics;
}) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

  async function pause(id: string) {
    const updated = await pauseSubscription(createBrowserApiClient(), id);
    setSubscriptions((current) => current.map((row) => (row.id === id ? updated : row)));
  }

  async function cancel(id: string) {
    const updated = await cancelSubscription(createBrowserApiClient(), id);
    setSubscriptions((current) => current.map((row) => (row.id === id ? updated : row)));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="Active subscriptions" value={analytics.activeSubscriptions} />
        <Metric title="Subscription revenue" value={formatMoney(analytics.subscriptionRevenue)} />
        <Metric title="Recurring forecast" value={formatMoney(analytics.recurringRevenueForecast)} />
        <Metric title="Churn rate" value={`${analytics.churnRate}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Next run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <Link className="font-medium underline-offset-4 hover:underline" href={`/subscriptions/${subscription.id}`}>
                      {subscription.customer?.name ?? subscription.customerId.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{subscription.customer?.email ?? subscription.customer?.phone ?? 'No contact'}</p>
                  </TableCell>
                  <TableCell>{subscription.items.map((item) => `${item.quantity}x ${item.itemId.slice(0, 8)}`).join(', ')}</TableCell>
                  <TableCell>{subscription.schedule}</TableCell>
                  <TableCell>{formatDate(subscription.nextRunAt)}</TableCell>
                  <TableCell><Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge></TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => void pause(subscription.id)}>Pause</Button>
                    <Button size="sm" variant="destructive" onClick={() => void cancel(subscription.id)}>Cancel</Button>
                  </TableCell>
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
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
