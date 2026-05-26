'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
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
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground">Create tickets, follow replies, and keep order issues in one thread.</p>
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(event) => void createTicket(event)}>
            <Input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
            <div className="grid gap-3 md:grid-cols-2">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="order_issue">Order issue</option>
                <option value="delivery_issue">Delivery issue</option>
                <option value="refund">Refund</option>
                <option value="product_issue">Product issue</option>
                <option value="subscription">Subscription</option>
                <option value="loyalty">Loyalty</option>
                <option value="general">General</option>
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <Input placeholder="Order ID (optional)" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            <Input placeholder="Attachment name or reference (optional)" value={attachmentName} onChange={(event) => setAttachmentName(event.target.value)} />
            <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened" required />
            <Button type="submit">Create ticket</Button>
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
              <button
                key={ticket.id}
                type="button"
                className="w-full rounded-lg border p-3 text-left"
                onClick={() => setSelectedId(ticket.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{ticket.subject}</p>
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.category} · {formatDateTime(ticket.createdAt)}</p>
              </button>
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
                <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to support" />
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
