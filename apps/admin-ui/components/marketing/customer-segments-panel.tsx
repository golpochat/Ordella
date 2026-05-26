'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createSegment, deleteSegment, previewSegment, updateSegment, type MarketingPreviewCustomer, type MarketingSegment } from '@/lib/api/admin/marketing';
import { getErrorMessage } from '@/lib/utils';

export function CustomerSegmentsPanel({ initialSegments }: { initialSegments: MarketingSegment[] }) {
  const [segments, setSegments] = useState(initialSegments);
  const [preview, setPreview] = useState<MarketingPreviewCustomer[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [builderType, setBuilderType] = useState<MarketingSegment['builderType']>('custom');
  const [filters, setFilters] = useState({
    minOrderCount: '',
    maxOrderCount: '',
    lastOrderBefore: '',
    lastOrderAfter: '',
    minTotalSpend: '',
    maxTotalSpend: '',
    minAvgOrderValue: '',
    minLoyaltyPoints: '',
    churnRisk: '',
    rfm: '',
    behaviorEvent: '',
    minViews: '',
    minClicks: '',
    minPurchases: '',
    minFrequency: '',
    maxFrequency: '',
    locationId: '',
    orderType: '',
    categoryPurchased: '',
    newVsReturning: '',
    crmSegment: '',
    tag: '',
  });
  const [error, setError] = useState<string | null>(null);

  function buildFilters() {
    return Object.fromEntries(
      Object.entries(filters)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => [
          key,
          [
            'minOrderCount',
            'maxOrderCount',
            'minTotalSpend',
            'maxTotalSpend',
            'minAvgOrderValue',
            'minLoyaltyPoints',
            'minViews',
            'minClicks',
            'minPurchases',
            'minFrequency',
            'maxFrequency',
          ].includes(key) ? Number(value) : value,
        ]),
    );
  }

  function ruleSummary(nextFilters = buildFilters()) {
    return Object.entries(nextFilters).map(([field, value]) => ({ field, operator: 'matches', value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const nextFilters = buildFilters();
      const body = { name, filters: nextFilters, builderType, ruleSummary: ruleSummary(nextFilters) };
      const segment = editingId
        ? await updateSegment(createBrowserApiClient(), editingId, body)
        : await createSegment(createBrowserApiClient(), body);
      setSegments((current) => editingId ? current.map((row) => row.id === segment.id ? segment : row) : [segment, ...current]);
      setName('');
      setEditingId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    await deleteSegment(createBrowserApiClient(), id);
    setSegments((current) => current.filter((segment) => segment.id !== id));
  }

  async function loadPreview(id: string) {
    setPreview(await previewSegment(createBrowserApiClient(), id));
  }

  function edit(segment: MarketingSegment) {
    const source = segment.filters as Record<string, unknown>;
    setEditingId(segment.id);
    setName(segment.name);
    setBuilderType(segment.builderType);
    setFilters((current) => Object.fromEntries(
      Object.keys(current).map((key) => [key, source[key] === undefined ? '' : String(source[key])]),
    ) as typeof filters);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Segment name" value={name} onChange={(event) => setName(event.target.value)} required />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={builderType} onChange={(event) => setBuilderType(event.target.value as MarketingSegment['builderType'])}>
            <option value="rfm">RFM segment</option>
            <option value="ltv">LTV segment</option>
            <option value="churn">Churn-risk segment</option>
            <option value="behavior">Behavior-based segment</option>
            <option value="custom">Custom rules</option>
          </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Minimum orders" type="number" value={filters.minOrderCount} onChange={(event) => setFilters((f) => ({ ...f, minOrderCount: event.target.value }))} />
          <Input placeholder="Maximum orders" type="number" value={filters.maxOrderCount} onChange={(event) => setFilters((f) => ({ ...f, maxOrderCount: event.target.value }))} />
          <Input placeholder="Minimum total spend" type="number" value={filters.minTotalSpend} onChange={(event) => setFilters((f) => ({ ...f, minTotalSpend: event.target.value }))} />
          <Input placeholder="Maximum total spend" type="number" value={filters.maxTotalSpend} onChange={(event) => setFilters((f) => ({ ...f, maxTotalSpend: event.target.value }))} />
          <Input placeholder="Minimum AOV" type="number" value={filters.minAvgOrderValue} onChange={(event) => setFilters((f) => ({ ...f, minAvgOrderValue: event.target.value }))} />
          <Input placeholder="Minimum loyalty points" type="number" value={filters.minLoyaltyPoints} onChange={(event) => setFilters((f) => ({ ...f, minLoyaltyPoints: event.target.value }))} />
          <Input placeholder="Last order before" type="date" value={filters.lastOrderBefore} onChange={(event) => setFilters((f) => ({ ...f, lastOrderBefore: event.target.value }))} />
          <Input placeholder="Last order after" type="date" value={filters.lastOrderAfter} onChange={(event) => setFilters((f) => ({ ...f, lastOrderAfter: event.target.value }))} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.rfm} onChange={(event) => setFilters((f) => ({ ...f, rfm: event.target.value }))}>
            <option value="">Any RFM</option>
            <option value="champions">Champions</option>
            <option value="loyal">Loyal customers</option>
            <option value="at_risk">At risk</option>
            <option value="new">New customers</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.churnRisk} onChange={(event) => setFilters((f) => ({ ...f, churnRisk: event.target.value }))}>
            <option value="">Any churn risk</option>
            <option value="low">Low churn risk</option>
            <option value="medium">Medium churn risk</option>
            <option value="high">High churn risk</option>
          </select>
          <Input placeholder="Location ID" value={filters.locationId} onChange={(event) => setFilters((f) => ({ ...f, locationId: event.target.value }))} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.orderType} onChange={(event) => setFilters((f) => ({ ...f, orderType: event.target.value }))}>
            <option value="">Any order type</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
            <option value="pos">In-store</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.newVsReturning} onChange={(event) => setFilters((f) => ({ ...f, newVsReturning: event.target.value }))}>
            <option value="">Any lifecycle</option>
            <option value="new">New customers</option>
            <option value="returning">Returning customers</option>
          </select>
          <Input placeholder="Category ID purchased" value={filters.categoryPurchased} onChange={(event) => setFilters((f) => ({ ...f, categoryPurchased: event.target.value }))} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.behaviorEvent} onChange={(event) => setFilters((f) => ({ ...f, behaviorEvent: event.target.value }))}>
            <option value="">Any behavior</option>
            <option value="view">Viewed</option>
            <option value="click">Clicked</option>
            <option value="purchase">Purchased</option>
          </select>
          <Input placeholder="Minimum views" type="number" value={filters.minViews} onChange={(event) => setFilters((f) => ({ ...f, minViews: event.target.value }))} />
          <Input placeholder="Minimum clicks" type="number" value={filters.minClicks} onChange={(event) => setFilters((f) => ({ ...f, minClicks: event.target.value }))} />
          <Input placeholder="Minimum purchases" type="number" value={filters.minPurchases} onChange={(event) => setFilters((f) => ({ ...f, minPurchases: event.target.value }))} />
          <Input placeholder="Minimum frequency" type="number" value={filters.minFrequency} onChange={(event) => setFilters((f) => ({ ...f, minFrequency: event.target.value }))} />
          <Input placeholder="Maximum frequency" type="number" value={filters.maxFrequency} onChange={(event) => setFilters((f) => ({ ...f, maxFrequency: event.target.value }))} />
          <Input placeholder="CRM segment, e.g. High-value customers" value={filters.crmSegment} onChange={(event) => setFilters((f) => ({ ...f, crmSegment: event.target.value }))} />
          <Input placeholder="Customer tag, e.g. VIP" value={filters.tag} onChange={(event) => setFilters((f) => ({ ...f, tag: event.target.value }))} />
          </div>
          <Button type="submit">{editingId ? 'Update segment' : 'Save segment'}</Button>
        </form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Filters</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map((segment) => (
              <TableRow key={segment.id}>
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{segment.builderType}</Badge>
                  {Object.entries(segment.filters).map(([key, value]) => <Badge key={key} variant="outline">{key}: {String(value)}</Badge>)}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => edit(segment)}>Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => void loadPreview(segment.id)}>Preview</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void remove(segment.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {preview.length ? (
          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Preview: {preview.length} matching customers</p>
            <div className="grid gap-1 text-sm text-muted-foreground">
              {preview.slice(0, 10).map((customer) => (
                <span key={customer.id}>{customer.name} · {customer.email ?? customer.phone ?? customer.id}</span>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
