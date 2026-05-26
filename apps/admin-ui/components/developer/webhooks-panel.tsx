'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createWebhook, disableWebhook, rotateWebhookSecret, testWebhook, type DeveloperWebhook } from '@/lib/api/admin/developer';
import { formatDate, getErrorMessage } from '@/lib/utils';

const EVENTS = [
  'order.created',
  'order.updated',
  'order.ready',
  'order.delivered',
  'inventory.changed',
  'inventory.low',
  'inventory.out',
  'customer.created',
  'customer.updated',
  'subscription.renewed',
  'subscription.canceled',
  'promotion.created',
  'promotion.updated',
  'payment.succeeded',
  'payment.failed',
  'product.updated',
  'item.updated',
  'item.outOfStock',
];

export function WebhooksPanel({ initialWebhooks }: { initialWebhooks: DeveloperWebhook[] }) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['order.created']);
  const [secret, setSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const webhook = await createWebhook(createBrowserApiClient(), { url, events });
      setWebhooks((current) => [webhook, ...current]);
      setSecret(webhook.secret ?? null);
      setUrl('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function disable(id: string) {
    const updated = await disableWebhook(createBrowserApiClient(), id);
    setWebhooks((current) => current.map((webhook) => (webhook.id === id ? updated : webhook)));
  }

  async function rotate(id: string) {
    const updated = await rotateWebhookSecret(createBrowserApiClient(), id);
    setWebhooks((current) => current.map((webhook) => (webhook.id === id ? updated : webhook)));
    setSecret(updated.secret ?? null);
  }

  async function test(id: string) {
    await testWebhook(createBrowserApiClient(), id);
    setMessage('Test webhook queued');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={create}>
          <Input placeholder="https://example.com/webhooks/ordella" value={url} onChange={(event) => setUrl(event.target.value)} required />
          <Button type="submit">Create webhook</Button>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            {EVENTS.map((event) => (
              <label key={event} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={(input) =>
                    setEvents((current) =>
                      input.target.checked ? [...current, event] : current.filter((item) => item !== event),
                    )
                  }
                />
                {event}
              </label>
            ))}
          </div>
        </form>
        {secret ? (
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-sm font-medium">Webhook secret</p>
            <code className="mt-2 block break-all text-sm">{secret}</code>
          </div>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="max-w-sm break-all">{webhook.url}</TableCell>
                <TableCell>{webhook.events.join(', ')}</TableCell>
                <TableCell>
                  <Badge variant={webhook.isActive ? 'outline' : 'destructive'}>{webhook.isActive ? 'Active' : 'Disabled'}</Badge>
                </TableCell>
                <TableCell>{formatDate(webhook.lastDeliveryAt ?? undefined)}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void test(webhook.id)} disabled={!webhook.isActive}>
                    Test
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => void rotate(webhook.id)}>
                    Rotate secret
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void disable(webhook.id)} disabled={!webhook.isActive}>
                    Disable
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
