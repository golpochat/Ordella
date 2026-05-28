'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createCampaign, deleteCampaign, duplicateCampaign, sendCampaignNow, updateCampaign, type MarketingAnalytics, type MarketingCampaign, type MarketingSegment } from '@/lib/api/admin/marketing';
import { DeleteConfirmDialog } from '@/components/ui/admin-dialog';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

const TEMPLATES = [
  { label: 'Welcome series', type: 'email', category: 'welcome_series', subject: 'Welcome to Ordella', message: 'Hi {{name}}, welcome. Your first reward is waiting.' },
  { label: 'Abandoned cart', type: 'email', category: 'abandoned_cart', subject: 'You left something behind', message: 'Hi {{name}}, your basket is still waiting.' },
  { label: 'Birthday reward', type: 'email', category: 'birthday_rewards', subject: 'A birthday reward for you', message: 'Happy birthday {{name}}. Enjoy your reward.' },
  { label: 'Tier upgrade', type: 'push', category: 'tier_upgrade', subject: '', message: 'You unlocked a new loyalty tier.' },
  { label: 'Product recommendations', type: 'email', category: 'product_recommendations', subject: 'Picked for you', message: 'Hi {{name}}, here are products we think you will like.' },
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
    type: 'email' as 'email' | 'sms' | 'push',
    campaignType: 'broadcast' as 'broadcast' | 'trigger-based' | 'journey',
    channels: ['email'] as Array<'email' | 'sms' | 'push'>,
    segmentId: segments[0]?.id ?? '',
    subject: '',
    message: '',
    scheduleAt: '',
    scheduleType: 'one-time' as 'one-time' | 'recurring',
    recurrenceRule: '',
    campaignCategory: 'welcome_series',
    frequencyCap: '1',
    frequencyCapDays: '7',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingCampaign | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(index: string) {
    const template = TEMPLATES[Number(index)];
    if (!template) return;
    setForm((current) => ({
      ...current,
      type: template.type as 'email' | 'sms' | 'push',
      channels: [template.type as 'email' | 'sms' | 'push'],
      campaignCategory: 'category' in template ? String(template.category) : current.campaignCategory,
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
        frequencyCap: Number(form.frequencyCap),
        safetyRules: { frequencyCapDays: Number(form.frequencyCapDays), respectOptIn: true, gdprCompliant: true },
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
      campaignType: campaign.campaignType,
      channels: campaign.channels.length ? campaign.channels : [campaign.type],
      segmentId: campaign.segmentId,
      subject: campaign.subject ?? '',
      message: campaign.message,
      scheduleAt: campaign.scheduleAt ? campaign.scheduleAt.slice(0, 16) : '',
      scheduleType: campaign.scheduleType,
      recurrenceRule: campaign.recurrenceRule ?? '',
      campaignCategory: campaign.campaignCategory ?? 'welcome_series',
      frequencyCap: String(campaign.frequencyCap ?? 1),
      frequencyCapDays: String((campaign.safetyRules?.frequencyCapDays as number | undefined) ?? 7),
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCampaign(createBrowserApiClient(), deleteTarget.id);
      setCampaigns((current) => current.filter((campaign) => campaign.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteTarget?.name}
        title={deleteTarget ? `Delete campaign "${deleteTarget.name}"?` : 'Delete campaign?'}
        description="This campaign and its schedule will be permanently removed."
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
      <MetricGrid columns={4}>
        <Metric title="Campaigns" value={analytics.campaigns} />
        <Metric title="Sent" value={analytics.sent} />
        <Metric title="Delivered" value={analytics.delivered} />
        <Metric title="Failed" value={analytics.failed} />
      </MetricGrid>
      <Card>
        <CardHeader><CardTitle>Campaign Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={save}>
            <Input placeholder="Campaign name" value={form.name} onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))} required />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" onChange={(event) => applyTemplate(event.target.value)} defaultValue="">
              <option value="">Choose a template</option>
              {TEMPLATES.map((template, index) => <option key={template.label} value={index}>{template.label}</option>)}
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.campaignType} onChange={(event) => setForm((f) => ({ ...f, campaignType: event.target.value as typeof form.campaignType }))}>
              <option value="broadcast">Broadcast</option>
              <option value="trigger-based">Trigger-based</option>
              <option value="journey">Journey</option>
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.type} onChange={(event) => setForm((f) => ({ ...f, type: event.target.value as 'email' | 'sms' | 'push', channels: [event.target.value as 'email' | 'sms' | 'push'] }))}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.segmentId} onChange={(event) => setForm((f) => ({ ...f, segmentId: event.target.value }))} required>
              <option value="">Select segment</option>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.campaignCategory} onChange={(event) => setForm((f) => ({ ...f, campaignCategory: event.target.value }))}>
              <option value="welcome_series">Welcome series</option>
              <option value="abandoned_cart">Abandoned cart</option>
              <option value="win_back">Win-back</option>
              <option value="birthday_rewards">Birthday rewards</option>
              <option value="tier_upgrade">Loyalty tier upgrade</option>
              <option value="product_recommendations">Product recommendations</option>
              <option value="low_stock_alert">Low-stock customer alert</option>
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.scheduleType} onChange={(event) => setForm((f) => ({ ...f, scheduleType: event.target.value as typeof form.scheduleType }))}>
              <option value="one-time">One-time</option>
              <option value="recurring">Recurring</option>
            </Select>
            {form.type === 'email' ? <Input placeholder="Subject" value={form.subject} onChange={(event) => setForm((f) => ({ ...f, subject: event.target.value }))} /> : null}
            <Input type="datetime-local" value={form.scheduleAt} onChange={(event) => setForm((f) => ({ ...f, scheduleAt: event.target.value }))} />
            <Input placeholder="Recurrence, e.g. every 7 days" value={form.recurrenceRule} onChange={(event) => setForm((f) => ({ ...f, recurrenceRule: event.target.value }))} />
            <Input placeholder="Frequency cap per customer" type="number" value={form.frequencyCap} onChange={(event) => setForm((f) => ({ ...f, frequencyCap: event.target.value }))} />
            <Input placeholder="Frequency cap window days" type="number" value={form.frequencyCapDays} onChange={(event) => setForm((f) => ({ ...f, frequencyCapDays: event.target.value }))} />
            <Textarea className="min-h-28 rounded-md border border-border-default bg-background p-3 text-sm md:col-span-2" placeholder="Message. Supports {{name}} and {{points}}." value={form.message} onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))} required />
            <Button type="submit">{editingId ? 'Update campaign' : 'Save campaign'}</Button>
            {editingId ? <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel edit</Button> : null}
          </form>
          {error ? <FormErrorAlert message={error} /> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Channels</TableHead><TableHead>Segment</TableHead><TableHead>Status</TableHead><TableHead>Perf.</TableHead><TableHead>Schedule</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody zebra>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.campaignType}</TableCell>
                  <TableCell>{(campaign.channels.length ? campaign.channels : [campaign.type]).join(', ')}</TableCell>
                  <TableCell>{campaign.segmentName ?? campaign.segmentId.slice(0, 8)}</TableCell>
                  <TableCell><Tag variant={campaign.status === 'sent' ? 'outline' : 'neutral'}><TagLabel>{campaign.status}</TagLabel></Tag></TableCell>
                  <TableCell>{campaign.sentCount ?? 0} sent · {campaign.openCount ?? 0} opens · {campaign.clickCount ?? 0} clicks · {campaign.conversionCount ?? 0} conv.</TableCell>
                  <TableCell>{formatDate(campaign.scheduleAt ?? undefined)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => edit(campaign)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => void send(campaign.id)}>Send now</Button>
                    <Button size="sm" variant="outline" onClick={() => void duplicate(campaign.id)}>Duplicate</Button>
                    <Button size="sm" variant="error" onClick={() => setDeleteTarget(campaign)}>
                      Delete
                    </Button>
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
