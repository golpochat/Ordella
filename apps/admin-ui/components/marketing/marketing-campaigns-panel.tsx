'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createCampaign, deleteCampaign, duplicateCampaign, sendCampaignNow, updateCampaign, type MarketingAnalytics, type MarketingCampaign, type MarketingSegment } from '@/lib/api/admin/marketing';
import { formatDate, getErrorMessage } from '@/lib/utils';

const TEMPLATES = [
  { label: 'Welcome email', type: 'email', subject: 'Welcome to our business', message: 'Hi {{name}}, thanks for joining us.' },
  { label: 'Win-back', type: 'email', subject: 'We miss you', message: 'Hi {{name}}, we miss you. Come back soon for something new.' },
  { label: 'Low stock promotion', type: 'email', subject: 'Limited stock available', message: 'Popular items are available for a limited time.' },
  { label: 'New product launch', type: 'email', subject: 'New arrivals today', message: 'Discover our latest products today.' },
  { label: 'Seasonal promotion', type: 'email', subject: 'Seasonal promotion', message: 'Enjoy a fresh seasonal offer from us.' },
  { label: 'Favourite items are back', type: 'sms', subject: '', message: 'Your favourite items are back. Visit us today.' },
  { label: 'Exclusive offer', type: 'sms', subject: '', message: 'Exclusive offer for you. Shop today.' },
  { label: 'New arrivals', type: 'sms', subject: '', message: 'New arrivals today. See what is new.' },
];

export function MarketingCampaignsPanel({
  initialCampaigns,
  segments,
  analytics,
}: {
  initialCampaigns: MarketingCampaign[];
  segments: MarketingSegment[];
  analytics: MarketingAnalytics;
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [form, setForm] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    segmentId: segments[0]?.id ?? '',
    subject: '',
    message: '',
    scheduleAt: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(index: string) {
    const template = TEMPLATES[Number(index)];
    if (!template) return;
    setForm((current) => ({
      ...current,
      type: template.type as 'email' | 'sms',
      subject: template.subject,
      message: template.message,
    }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const body = {
        ...form,
        scheduleAt: form.scheduleAt ? new Date(form.scheduleAt).toISOString() : undefined,
      };
      const campaign = editingId
        ? await updateCampaign(createBrowserApiClient(), editingId, body)
        : await createCampaign(createBrowserApiClient(), body);
      setCampaigns((current) => editingId
        ? current.map((row) => (row.id === editingId ? campaign : row))
        : [campaign, ...current]);
      setForm((current) => ({ ...current, name: '', subject: '', message: '', scheduleAt: '' }));
      setEditingId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function edit(campaign: MarketingCampaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      type: campaign.type,
      segmentId: campaign.segmentId,
      subject: campaign.subject ?? '',
      message: campaign.message,
      scheduleAt: campaign.scheduleAt ? campaign.scheduleAt.slice(0, 16) : '',
    });
  }

  async function send(id: string) {
    const updated = await sendCampaignNow(createBrowserApiClient(), id);
    setCampaigns((current) => current.map((campaign) => (campaign.id === id ? updated : campaign)));
  }

  async function duplicate(id: string) {
    const copy = await duplicateCampaign(createBrowserApiClient(), id);
    setCampaigns((current) => [copy, ...current]);
  }

  async function remove(id: string) {
    await deleteCampaign(createBrowserApiClient(), id);
    setCampaigns((current) => current.filter((campaign) => campaign.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Campaigns</p><p className="text-2xl font-semibold">{analytics.campaigns}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Sent</p><p className="text-2xl font-semibold">{analytics.sent}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Delivered</p><p className="text-2xl font-semibold">{analytics.delivered}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-semibold">{analytics.failed}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Campaign Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={save}>
            <Input placeholder="Campaign name" value={form.name} onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))} required />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" onChange={(event) => applyTemplate(event.target.value)} defaultValue="">
              <option value="">Choose a template</option>
              {TEMPLATES.map((template, index) => <option key={template.label} value={index}>{template.label}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(event) => setForm((f) => ({ ...f, type: event.target.value as 'email' | 'sms' }))}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.segmentId} onChange={(event) => setForm((f) => ({ ...f, segmentId: event.target.value }))} required>
              <option value="">Select segment</option>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
            </select>
            {form.type === 'email' ? <Input placeholder="Subject" value={form.subject} onChange={(event) => setForm((f) => ({ ...f, subject: event.target.value }))} /> : null}
            <Input type="datetime-local" value={form.scheduleAt} onChange={(event) => setForm((f) => ({ ...f, scheduleAt: event.target.value }))} />
            <textarea className="min-h-28 rounded-md border border-input bg-background p-3 text-sm md:col-span-2" placeholder="Message. Supports {{name}} and {{points}}." value={form.message} onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))} required />
            <Button type="submit">{editingId ? 'Update campaign' : 'Save campaign'}</Button>
            {editingId ? <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel edit</Button> : null}
          </form>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Segment</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Schedule</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>{campaign.segmentName ?? campaign.segmentId.slice(0, 8)}</TableCell>
                  <TableCell><Badge variant={campaign.status === 'sent' ? 'outline' : 'secondary'}>{campaign.status}</Badge></TableCell>
                  <TableCell>{campaign.sentCount ?? 0}</TableCell>
                  <TableCell>{formatDate(campaign.scheduleAt ?? undefined)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => edit(campaign)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => void send(campaign.id)}>Send now</Button>
                    <Button size="sm" variant="outline" onClick={() => void duplicate(campaign.id)}>Duplicate</Button>
                    <Button size="sm" variant="destructive" onClick={() => void remove(campaign.id)}>Delete</Button>
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
