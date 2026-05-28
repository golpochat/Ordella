'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, FormField, Grid, Heading, Input, Select, Stack, Text, TextMuted, Textarea } from '@shared-ui';
import {
  createSupportTicket,
  fetchSupportTickets,
  rateSupportTicket,
  replyToSupportTicket,
  type SupportTicket,
} from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

export function SupportView() {
  const { formatDateTime } = useTenantSettings();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;

  async function load() {
    const rows = await fetchSupportTickets();
    setTickets(rows);
    setSelectedId((current) => current || rows[0]?.id || '');
  }

  useEffect(() => {
    void load().catch(() => setStatus('Could not load support tickets.'));
  }, []);

  async function createTicket(event: React.FormEvent) {
    event.preventDefault();
    const attachments = attachmentName.trim() ? [{ name: attachmentName.trim() }] : undefined;
    const ticket = await createSupportTicket({
      subject,
      category,
      priority,
      orderId: orderId || undefined,
      message,
      attachments,
    });
    setTickets((current) => [ticket, ...current]);
    setSelectedId(ticket.id);
    setSubject('');
    setOrderId('');
    setMessage('');
    setAttachmentName('');
    setStatus('Ticket created. We will notify you when support replies.');
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    const updated = await replyToSupportTicket(selected.id, reply);
    setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    setReply('');
  }

  async function rate(ticketId: string, rating: number) {
    const updated = await rateSupportTicket(ticketId, rating);
    setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <Heading level={1} size="lg">Support</Heading>
        <TextMuted>Create tickets, follow replies, and keep order issues in one thread.</TextMuted>
      </div>
      {status ? <Text variant="muted" size="sm" aria-live="polite">{status}</Text> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void createTicket(event)}>
            <Stack gap="md">
              <FormField label="Subject" htmlFor="support-subject" required>
                <Input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
              </FormField>
            <Grid cols={2} gap="md" responsive>
              <FormField label="Category" htmlFor="support-category">
                <Select id="support-category" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="order_issue">Order issue</option>
                <option value="delivery_issue">Delivery issue</option>
                <option value="refund">Refund</option>
                <option value="product_issue">Product issue</option>
                <option value="subscription">Subscription</option>
                <option value="loyalty">Loyalty</option>
                <option value="general">General</option>
                </Select>
              </FormField>
              <FormField label="Priority" htmlFor="support-priority">
                <Select id="support-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                </Select>
              </FormField>
            </Grid>
            <FormField label="Order ID" htmlFor="support-order-id" helper="Optional">
              <Input id="support-order-id" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            </FormField>
            <FormField label="Attachment name or reference" htmlFor="support-attachment" helper="Optional">
              <Input id="support-attachment" value={attachmentName} onChange={(event) => setAttachmentName(event.target.value)} />
            </FormField>
            <FormField label="Message" htmlFor="support-message" required>
              <Textarea id="support-message" className="min-h-28" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened" required />
            </FormField>
            <Button type="submit">Create ticket</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.map((ticket) => (
              <Button
                key={ticket.id}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start rounded-lg p-3 text-left"
                onClick={() => setSelectedId(ticket.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{ticket.subject}</p>
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.category} · {formatDateTime(ticket.createdAt)}</p>
              </Button>
            ))}
            {!tickets.length ? <p className="text-sm text-muted-foreground">No tickets yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selected?.subject ?? 'Ticket thread'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selected ? (
              <>
                <p className="text-muted-foreground">SLA due: {selected.slaDueAt ? formatDateTime(selected.slaDueAt) : 'Not set'}</p>
                {selected.messages.map((item) => (
                  <div key={item.id} className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">{item.authorType} · {formatDateTime(item.createdAt)}</p>
                    <p className="mt-1">{item.body}</p>
                  </div>
                ))}
                <FormField label="Reply" htmlFor="support-reply">
                  <Textarea id="support-reply" className="min-h-20" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to support" />
                </FormField>
                <Button type="button" onClick={() => void sendReply()} disabled={!reply.trim()}>
                  Reply
                </Button>
                {selected.status === 'resolved' || selected.status === 'closed' ? (
                  <div className="flex gap-2 border-t pt-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button key={rating} type="button" variant={selected.csatRating === rating ? 'default' : 'outline'} onClick={() => void rate(selected.id, rating)}>
                        {rating}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">Select a ticket to view replies.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
