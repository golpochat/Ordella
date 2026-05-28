'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack, Textarea } from '@shared-ui';
import { addSupportMessage, updateSupportTicket, type CannedResponse, type SupportAnalytics, type SupportTicket } from '@/lib/api/admin/support';
import { createBrowserApiClient } from '@/lib/api/browser';
import { formatDate } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import {
  FilterActions,
  FilterBar,
  FilterGroup,
  FilterItem,
  FilterResetButton,
  FilterSelect,
} from '@/components/ui/admin-filter';

export function SupportInboxPanel({
  initialTickets,
  analytics,
  cannedResponses,
}: {
  initialTickets: SupportTicket[];
  analytics: SupportAnalytics;
  cannedResponses: CannedResponse[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState(initialTickets[0]?.id ?? '');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [reply, setReply] = useState('');
  const [internalOnly, setInternalOnly] = useState(false);
  const [assignee, setAssignee] = useState('');

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null;
  const filtered = useMemo(() => tickets.filter((ticket) => (
    (!filters.status || ticket.status === filters.status) &&
    (!filters.category || ticket.category === filters.category) &&
    (!filters.priority || ticket.priority === filters.priority)
  )), [filters, tickets]);

  async function patchTicket(ticketId: string, body: { status?: string; priority?: string; assignedTo?: string }) {
    const updated = await updateSupportTicket(createBrowserApiClient(), ticketId, body);
    setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    setSelectedId(updated.id);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    const updated = await addSupportMessage(createBrowserApiClient(), selected.id, { body: reply, internalOnly });
    setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    setReply('');
    setInternalOnly(false);
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={5}>
        <Metric title="Total tickets" value={analytics.totalTickets} />
        <Metric title="Open tickets" value={analytics.openTickets} />
        <Metric title="Avg resolution" value={`${analytics.averageResolutionHours}h`} />
        <Metric title="SLA compliance" value={`${analytics.slaCompliance}%`} />
        <Metric title="CSAT" value={analytics.csatAverage ?? 'No ratings'} />
      </MetricGrid>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Support Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FilterBar as="div">
              <FilterGroup columns={3}>
                <FilterItem label="Status" htmlFor="support-status" active={Boolean(filters.status)}>
                  <FilterSelect
                    id="support-status"
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="">All statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="waiting_customer">Waiting customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </FilterSelect>
                </FilterItem>
                <FilterItem label="Category" htmlFor="support-category" active={Boolean(filters.category)}>
                  <FilterSelect
                    id="support-category"
                    value={filters.category}
                    onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
                  >
                    <option value="">All categories</option>
                    <option value="order_issue">Order issue</option>
                    <option value="delivery_issue">Delivery issue</option>
                    <option value="refund">Refund</option>
                    <option value="product_issue">Product issue</option>
                    <option value="subscription">Subscription</option>
                    <option value="loyalty">Loyalty</option>
                    <option value="general">General</option>
                  </FilterSelect>
                </FilterItem>
                <FilterItem label="Priority" htmlFor="support-priority" active={Boolean(filters.priority)}>
                  <FilterSelect
                    id="support-priority"
                    value={filters.priority}
                    onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </FilterSelect>
                </FilterItem>
              </FilterGroup>
              <FilterActions>
                <FilterResetButton
                  type="button"
                  onClick={() => setFilters({ status: '', category: '', priority: '' })}
                >
                  Clear
                </FilterResetButton>
              </FilterActions>
            </FilterBar>

            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {filtered.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer" onClick={() => setSelectedId(ticket.id)}>
                    <TableCell>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.category} · {ticket.priority}</p>
                    </TableCell>
                    <TableCell>{ticket.customer?.name ?? ticket.customerId.slice(0, 8)}</TableCell>
                    <TableCell><Tag variant={ticket.status === 'open' ? 'brand' : 'neutral'}><TagLabel>{ticket.status}</TagLabel></Tag></TableCell>
                    <TableCell>{ticket.sla?.breached ? <Tag variant="error"><TagLabel>Breached</TagLabel></Tag> : 'On track'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selected ? selected.subject : 'Ticket detail'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {selected ? (
              <>
                <div className="grid gap-2">
                  <p>Customer: {selected.customer?.name ?? selected.customerId}</p>
                  <p>Order: {selected.orderId ?? 'Not linked'}</p>
                  <p>Subscription: {selected.subscriptionId ?? 'Not linked'}</p>
                  <p>SLA due: {selected.slaDueAt ? formatDate(selected.slaDueAt) : 'Not set'}</p>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={selected.status} onChange={(event) => void patchTicket(selected.id, { status: event.target.value })}>
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="waiting_customer">Waiting customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={selected.priority} onChange={(event) => void patchTicket(selected.id, { priority: event.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Staff user ID" value={assignee} onChange={(event) => setAssignee(event.target.value)} />
                  <Button type="button" variant="outline" onClick={() => void patchTicket(selected.id, { assignedTo: assignee })} disabled={!assignee}>
                    Assign
                  </Button>
                </div>
                <div className="space-y-2 border-t pt-3">
                  {selected.messages.map((message) => (
                    <div key={message.id} className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">{message.authorType}{message.internalOnly ? ' · internal note' : ''} · {formatDate(message.createdAt)}</p>
                      <p className="mt-1">{message.body}</p>
                    </div>
                  ))}
                </div>
                <Select className="h-10 w-full rounded-md border border-border-default bg-background px-3 text-sm" onChange={(event) => setReply(event.target.value)} defaultValue="">
                  <option value="">Use canned response</option>
                  {cannedResponses.map((response) => <option key={response.id} value={response.body}>{response.title}</option>)}
                </Select>
                <Textarea className="min-h-24 w-full rounded-md border border-border-default bg-background px-3 py-2 text-sm" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply or internal note" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={internalOnly} onChange={(event) => setInternalOnly(event.target.checked)} />
                  Internal note
                </label>
                <Button type="button" onClick={() => void sendReply()} disabled={!reply.trim()}>
                  Send
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Select a ticket to view the thread.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}

