'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createSegment, deleteSegment, previewSegment, type MarketingPreviewCustomer, type MarketingSegment } from '@/lib/api/admin/marketing';
import { getErrorMessage } from '@/lib/utils';

export function CustomerSegmentsPanel({ initialSegments }: { initialSegments: MarketingSegment[] }) {
  const [segments, setSegments] = useState(initialSegments);
  const [preview, setPreview] = useState<MarketingPreviewCustomer[]>([]);
  const [name, setName] = useState('');
  const [filters, setFilters] = useState({
    minOrderCount: '',
    lastOrderBefore: '',
    minTotalSpend: '',
    minLoyaltyPoints: '',
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
          ['minOrderCount', 'minTotalSpend', 'minLoyaltyPoints'].includes(key) ? Number(value) : value,
        ]),
    );
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const segment = await createSegment(createBrowserApiClient(), { name, filters: buildFilters() });
      setSegments((current) => [segment, ...current]);
      setName('');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 md:grid-cols-3" onSubmit={save}>
          <Input placeholder="Segment name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="Minimum orders" type="number" value={filters.minOrderCount} onChange={(event) => setFilters((f) => ({ ...f, minOrderCount: event.target.value }))} />
          <Input placeholder="Minimum total spend" type="number" value={filters.minTotalSpend} onChange={(event) => setFilters((f) => ({ ...f, minTotalSpend: event.target.value }))} />
          <Input placeholder="Minimum loyalty points" type="number" value={filters.minLoyaltyPoints} onChange={(event) => setFilters((f) => ({ ...f, minLoyaltyPoints: event.target.value }))} />
          <Input placeholder="Last order before" type="date" value={filters.lastOrderBefore} onChange={(event) => setFilters((f) => ({ ...f, lastOrderBefore: event.target.value }))} />
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
          <Input placeholder="CRM segment, e.g. High-value customers" value={filters.crmSegment} onChange={(event) => setFilters((f) => ({ ...f, crmSegment: event.target.value }))} />
          <Input placeholder="Customer tag, e.g. VIP" value={filters.tag} onChange={(event) => setFilters((f) => ({ ...f, tag: event.target.value }))} />
          <Button type="submit">Save segment</Button>
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
                <TableCell className="font-mono text-xs">{JSON.stringify(segment.filters)}</TableCell>
                <TableCell className="space-x-2 text-right">
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
