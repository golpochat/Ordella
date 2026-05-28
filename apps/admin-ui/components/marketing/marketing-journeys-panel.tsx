'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { upsertJourney, type MarketingJourney, type MarketingSegment } from '@/lib/api/admin/marketing';
import { getErrorMessage } from '@/lib/utils';

const TRIGGERS = ['signup', 'first_order', 'churn_risk', 'birthday', 'tier_upgrade', 'abandoned_cart', 'low_stock'];
const ACTIONS = ['send_email', 'send_sms', 'send_push', 'apply_promotion', 'add_points'];

export function MarketingJourneysPanel({
  initialJourneys,
  segments,
}: {
  initialJourneys: MarketingJourney[];
  segments: MarketingSegment[];
}) {
  const [journeys, setJourneys] = useState(initialJourneys);
  const [form, setForm] = useState({
    name: '',
    trigger: 'signup',
    targetSegmentId: '',
    channels: ['email'],
    frequencyCap: '1',
    delayValue: '1',
    delayUnit: 'days',
    condition: 'if opted-in',
    action: 'send_email',
    promotionId: '',
    points: '100',
  });
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const steps = [
        { type: 'trigger', trigger: form.trigger },
        { type: 'delay', value: Number(form.delayValue), unit: form.delayUnit },
        { type: 'condition', expression: form.condition },
        {
          type: 'action',
          action: form.action,
          promotionId: form.promotionId || undefined,
          points: form.points ? Number(form.points) : undefined,
        },
      ];
      const journey = await upsertJourney(createBrowserApiClient(), {
        name: form.name,
        trigger: form.trigger,
        targetSegmentId: form.targetSegmentId || undefined,
        status: 'draft',
        channels: form.channels,
        frequencyCap: Number(form.frequencyCap),
        steps,
        safetyRules: { respectOptIn: true, gdprCompliant: true, frequencyCapDays: 7 },
        metadata: { builder: 'linear-flow' },
      });
      setJourneys((current) => [journey, ...current.filter((row) => row.id !== journey.id)]);
      setForm((current) => ({ ...current, name: '' }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Journey Builder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-3" onSubmit={save}>
            <Input placeholder="Journey name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.trigger} onChange={(event) => setForm((current) => ({ ...current, trigger: event.target.value }))}>
              {TRIGGERS.map((trigger) => <option key={trigger} value={trigger}>{trigger.replace(/_/g, ' ')}</option>)}
            </Select>
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.targetSegmentId} onChange={(event) => setForm((current) => ({ ...current, targetSegmentId: event.target.value }))}>
              <option value="">All eligible customers</option>
              {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
            </Select>
            <Input placeholder="Wait value" type="number" value={form.delayValue} onChange={(event) => setForm((current) => ({ ...current, delayValue: event.target.value }))} />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.delayUnit} onChange={(event) => setForm((current) => ({ ...current, delayUnit: event.target.value }))}>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </Select>
            <Input placeholder="Condition" value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))} />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3 text-sm" value={form.action} onChange={(event) => setForm((current) => ({ ...current, action: event.target.value }))}>
              {ACTIONS.map((action) => <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>)}
            </Select>
            <Input placeholder="Promotion ID for apply promotion" value={form.promotionId} onChange={(event) => setForm((current) => ({ ...current, promotionId: event.target.value }))} />
            <Input placeholder="Points for add points" type="number" value={form.points} onChange={(event) => setForm((current) => ({ ...current, points: event.target.value }))} />
            <Button type="submit">Save journey</Button>
          </form>
          <div className="grid gap-2 md:grid-cols-4">
            {['Trigger', 'Delay', 'Condition', 'Action'].map((step) => (
              <div key={step} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{step}</p>
                <p className="text-muted-foreground">Drag-ready flow step</p>
              </div>
            ))}
          </div>
          {error ? <FormErrorAlert message={error} /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Journeys</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow><TableHead>Name</TableHead><TableHead>Trigger</TableHead><TableHead>Channels</TableHead><TableHead>Status</TableHead><TableHead>Steps</TableHead></TableRow>
            </TableHeader>
            <TableBody zebra>
              {journeys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell className="font-medium">{journey.name}</TableCell>
                  <TableCell>{journey.trigger.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{journey.channels.join(', ')}</TableCell>
                  <TableCell><Tag variant="neutral"><TagLabel>{journey.status}</TagLabel></Tag></TableCell>
                  <TableCell>{journey.steps.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
