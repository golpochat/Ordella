'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { refreshCrmInsights, updateCrmCustomerTags, type CrmCustomerDetail } from '@/lib/api/admin/crm';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';

function field(row: unknown, key: string): string | number | boolean | null {
  if (!row || typeof row !== 'object') return null;
  const value = (row as Record<string, unknown>)[key];
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : null;
}

export function CrmCustomerProfilePanel({ initialCustomer }: { initialCustomer: CrmCustomerDetail }) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [tagInput, setTagInput] = useState(customer.tags.join(', '));
  const [notes, setNotes] = useState(customer.staffNotes ?? '');
  const [message, setMessage] = useState<string | null>(null);

  async function saveTags() {
    setMessage(null);
    try {
      const updated = await updateCrmCustomerTags(createBrowserApiClient(), {
        customerId: customer.id,
        tags: tagInput.split(',').map((tag) => tag.trim()).filter(Boolean),
        notes,
      });
      setCustomer((current) => ({ ...current, ...updated }));
      setMessage('Customer CRM profile updated.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function refresh() {
    setMessage(null);
    try {
      await refreshCrmInsights(createBrowserApiClient(), customer.id);
      setMessage('Insights updated. Refresh the page to see new generated segments and categories.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="Lifetime value" value={formatMoney(customer.lifetimeValue)} />
            <Metric title="Total orders" value={customer.totalOrders} />
            <Metric title="Average order" value={formatMoney(customer.avgOrderValue)} />
            <Metric title="Last order" value={formatDate(customer.lastOrderAt ?? undefined)} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="Loyalty points" value={customer.pointsBalance} />
            <Metric title="Store credit" value={formatMoney(customer.storeCreditBalance)} />
            <Metric title="Frequency" value={customer.insight?.orderFrequency ?? 'Unknown'} />
            <Metric title="Churn risk" value={customer.insight?.churnRiskScore ?? 'N/A'} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="Account status" value={customer.accountStatus ?? (customer.lastLoginAt ? 'registered' : 'guest')} />
            <Metric title="Last login" value={formatDate(customer.lastLoginAt ?? undefined)} />
            <Metric title="Email verified" value={customer.emailVerifiedAt ? 'Yes' : 'No'} />
            <Metric title="DOB" value={customer.dateOfBirth ?? 'Not set'} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Contact</p>
              <p className="text-muted-foreground">{customer.email ?? 'No email'}</p>
              <p className="text-muted-foreground">{customer.phone ?? 'No phone'}</p>
              <p className="text-muted-foreground">Gender: {customer.gender ?? 'Not set'}</p>
              <p className="text-muted-foreground">Preferred location: {customer.preferredLocationId ?? 'Unknown'}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Segments</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {customer.segments.map((segment) => <Badge key={segment} variant="secondary">{segment}</Badge>)}
                {!customer.segments.length ? <span className="text-muted-foreground">No generated segments yet.</span> : null}
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Communication preferences</p>
              <p className="text-muted-foreground">Email: {customer.notificationEmailOptIn ? 'enabled' : 'disabled'}</p>
              <p className="text-muted-foreground">SMS: {customer.notificationSmsOptIn ? 'enabled' : 'disabled'}</p>
              <p className="text-muted-foreground">Push: {customer.notificationPushOptIn ? 'enabled' : 'disabled'}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Marketing preferences</p>
              <p className="text-muted-foreground">Email: {customer.marketingEmailOptIn ? 'opted in' : 'opted out'}</p>
              <p className="text-muted-foreground">SMS: {customer.marketingSmsOptIn ? 'opted in' : 'opted out'}</p>
              <p className="text-muted-foreground">Push: {customer.marketingPushOptIn ? 'opted in' : 'opted out'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <Input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="VIP, Wholesale, Staff" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Staff notes</p>
            <textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Customer preferences, service notes, allergy notes, or wholesale terms" />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => void saveTags()}>Save CRM profile</Button>
            <Button type="button" variant="outline" onClick={() => void refresh()}>Update insights</Button>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Categories purchased</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {customer.insight?.categoriesPurchased.map((category) => <Badge key={category}>{category}</Badge>)}
            {!customer.insight?.categoriesPurchased.length ? <p className="text-sm text-muted-foreground">No product categories recorded yet.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Gift cards</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.giftCards.map((card) => {
              const row = card as { id?: string; code?: string; balance?: string };
              return <p key={row.id ?? row.code}>{row.code ?? 'Gift card'} · {formatMoney(row.balance ?? '0')}</p>;
            })}
            {!customer.giftCards.length ? <p className="text-muted-foreground">No linked gift cards.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Address book</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.addresses.map((address, index) => (
              <div key={String(field(address, 'id') ?? index)} className="rounded-md border p-2">
                <p className="font-medium">
                  {String(field(address, 'label') ?? 'Address')} {field(address, 'isDefault') ? '· Default' : ''}
                </p>
                <p className="text-muted-foreground">
                  {String(field(address, 'line1') ?? field(address, 'addressLine1') ?? '')}, {String(field(address, 'city') ?? '')}
                </p>
              </div>
            ))}
            {!customer.addresses.length ? <p className="text-muted-foreground">No saved addresses.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saved baskets</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.savedBaskets.map((basket, index) => (
              <p key={String(field(basket, 'id') ?? index)}>
                {String(field(basket, 'name') ?? 'Saved basket')} · {String(field(basket, 'itemCount') ?? 0)} items
              </p>
            ))}
            {!customer.savedBaskets.length ? <p className="text-muted-foreground">No saved baskets.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saved items</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.savedItems.map((item, index) => (
              <p key={String(field(item, 'id') ?? index)}>
                {String(field(item, 'label') ?? field(item, 'productId') ?? 'Saved item')}
              </p>
            ))}
            {!customer.savedItems.length ? <p className="text-muted-foreground">No saved items.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order history</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.orderType}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{formatMoney(order.total)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
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
