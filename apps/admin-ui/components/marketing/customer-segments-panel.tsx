'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import {
  DatePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterSelect,
} from '@/components/ui/admin-filter';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createSegment, deleteSegment, previewSegment, updateSegment, type MarketingPreviewCustomer, type MarketingSegment } from '@/lib/api/admin/marketing';
import { DeleteConfirmDialog } from '@/components/ui/admin-dialog';
import { getErrorMessage } from '@/lib/utils';

export function CustomerSegmentsPanel({ initialSegments }: { initialSegments: MarketingSegment[] }) {
  const [segments, setSegments] = useState(initialSegments);
  const [preview, setPreview] = useState<MarketingPreviewCustomer[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingSegment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSegment(createBrowserApiClient(), deleteTarget.id);
      setSegments((current) => current.filter((segment) => segment.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
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
    <>
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteTarget?.name}
        title={deleteTarget ? `Delete segment "${deleteTarget.name}"?` : 'Delete segment?'}
        description="Customers will no longer be grouped by this segment in campaigns."
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar onSubmit={save}>
          <FilterGroup columns={3}>
            <FilterItem label="Segment name" htmlFor="segment-name" active={Boolean(name)}>
              <FilterInput
                id="segment-name"
                placeholder="Segment name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </FilterItem>
            <FilterItem label="Builder type" htmlFor="segment-builder" active={Boolean(builderType)}>
              <FilterSelect
                id="segment-builder"
                value={builderType}
                onChange={(event) => setBuilderType(event.target.value as MarketingSegment['builderType'])}
              >
                <option value="rfm">RFM segment</option>
                <option value="ltv">LTV segment</option>
                <option value="churn">Churn-risk segment</option>
                <option value="behavior">Behavior-based segment</option>
                <option value="custom">Custom rules</option>
              </FilterSelect>
            </FilterItem>
          </FilterGroup>
          <FilterGroup columns={3}>
            <FilterItem label="Min orders" htmlFor="seg-min-orders" active={Boolean(filters.minOrderCount)}>
              <FilterInput id="seg-min-orders" type="number" placeholder="Minimum orders" value={filters.minOrderCount} onChange={(event) => setFilters((f) => ({ ...f, minOrderCount: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Max orders" htmlFor="seg-max-orders" active={Boolean(filters.maxOrderCount)}>
              <FilterInput id="seg-max-orders" type="number" placeholder="Maximum orders" value={filters.maxOrderCount} onChange={(event) => setFilters((f) => ({ ...f, maxOrderCount: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min spend" htmlFor="seg-min-spend" active={Boolean(filters.minTotalSpend)}>
              <FilterInput id="seg-min-spend" type="number" placeholder="Minimum total spend" value={filters.minTotalSpend} onChange={(event) => setFilters((f) => ({ ...f, minTotalSpend: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Max spend" htmlFor="seg-max-spend" active={Boolean(filters.maxTotalSpend)}>
              <FilterInput id="seg-max-spend" type="number" placeholder="Maximum total spend" value={filters.maxTotalSpend} onChange={(event) => setFilters((f) => ({ ...f, maxTotalSpend: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min AOV" htmlFor="seg-min-aov" active={Boolean(filters.minAvgOrderValue)}>
              <FilterInput id="seg-min-aov" type="number" placeholder="Minimum AOV" value={filters.minAvgOrderValue} onChange={(event) => setFilters((f) => ({ ...f, minAvgOrderValue: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min loyalty points" htmlFor="seg-min-loyalty" active={Boolean(filters.minLoyaltyPoints)}>
              <FilterInput id="seg-min-loyalty" type="number" placeholder="Minimum loyalty points" value={filters.minLoyaltyPoints} onChange={(event) => setFilters((f) => ({ ...f, minLoyaltyPoints: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Last order before" htmlFor="seg-order-before" active={Boolean(filters.lastOrderBefore)}>
              <DatePicker id="seg-order-before" value={filters.lastOrderBefore} onChange={(event) => setFilters((f) => ({ ...f, lastOrderBefore: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Last order after" htmlFor="seg-order-after" active={Boolean(filters.lastOrderAfter)}>
              <DatePicker id="seg-order-after" value={filters.lastOrderAfter} onChange={(event) => setFilters((f) => ({ ...f, lastOrderAfter: event.target.value }))} />
            </FilterItem>
            <FilterItem label="RFM" htmlFor="seg-rfm" active={Boolean(filters.rfm)}>
              <FilterSelect id="seg-rfm" value={filters.rfm} onChange={(event) => setFilters((f) => ({ ...f, rfm: event.target.value }))}>
                <option value="">Any RFM</option>
                <option value="champions">Champions</option>
                <option value="loyal">Loyal customers</option>
                <option value="at_risk">At risk</option>
                <option value="new">New customers</option>
              </FilterSelect>
            </FilterItem>
            <FilterItem label="Churn risk" htmlFor="seg-churn" active={Boolean(filters.churnRisk)}>
              <FilterSelect id="seg-churn" value={filters.churnRisk} onChange={(event) => setFilters((f) => ({ ...f, churnRisk: event.target.value }))}>
                <option value="">Any churn risk</option>
                <option value="low">Low churn risk</option>
                <option value="medium">Medium churn risk</option>
                <option value="high">High churn risk</option>
              </FilterSelect>
            </FilterItem>
            <FilterItem label="Location" htmlFor="seg-location" active={Boolean(filters.locationId)}>
              <FilterInput id="seg-location" placeholder="Location ID" value={filters.locationId} onChange={(event) => setFilters((f) => ({ ...f, locationId: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Order type" htmlFor="seg-order-type" active={Boolean(filters.orderType)}>
              <FilterSelect id="seg-order-type" value={filters.orderType} onChange={(event) => setFilters((f) => ({ ...f, orderType: event.target.value }))}>
                <option value="">Any order type</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="pos">In-store</option>
              </FilterSelect>
            </FilterItem>
            <FilterItem label="Lifecycle" htmlFor="seg-lifecycle" active={Boolean(filters.newVsReturning)}>
              <FilterSelect id="seg-lifecycle" value={filters.newVsReturning} onChange={(event) => setFilters((f) => ({ ...f, newVsReturning: event.target.value }))}>
                <option value="">Any lifecycle</option>
                <option value="new">New customers</option>
                <option value="returning">Returning customers</option>
              </FilterSelect>
            </FilterItem>
            <FilterItem label="Category purchased" htmlFor="seg-category" active={Boolean(filters.categoryPurchased)}>
              <FilterInput id="seg-category" placeholder="Category ID purchased" value={filters.categoryPurchased} onChange={(event) => setFilters((f) => ({ ...f, categoryPurchased: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Behavior" htmlFor="seg-behavior" active={Boolean(filters.behaviorEvent)}>
              <FilterSelect id="seg-behavior" value={filters.behaviorEvent} onChange={(event) => setFilters((f) => ({ ...f, behaviorEvent: event.target.value }))}>
                <option value="">Any behavior</option>
                <option value="view">Viewed</option>
                <option value="click">Clicked</option>
                <option value="purchase">Purchased</option>
              </FilterSelect>
            </FilterItem>
            <FilterItem label="Min views" htmlFor="seg-min-views" active={Boolean(filters.minViews)}>
              <FilterInput id="seg-min-views" type="number" placeholder="Minimum views" value={filters.minViews} onChange={(event) => setFilters((f) => ({ ...f, minViews: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min clicks" htmlFor="seg-min-clicks" active={Boolean(filters.minClicks)}>
              <FilterInput id="seg-min-clicks" type="number" placeholder="Minimum clicks" value={filters.minClicks} onChange={(event) => setFilters((f) => ({ ...f, minClicks: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min purchases" htmlFor="seg-min-purchases" active={Boolean(filters.minPurchases)}>
              <FilterInput id="seg-min-purchases" type="number" placeholder="Minimum purchases" value={filters.minPurchases} onChange={(event) => setFilters((f) => ({ ...f, minPurchases: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Min frequency" htmlFor="seg-min-freq" active={Boolean(filters.minFrequency)}>
              <FilterInput id="seg-min-freq" type="number" placeholder="Minimum frequency" value={filters.minFrequency} onChange={(event) => setFilters((f) => ({ ...f, minFrequency: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Max frequency" htmlFor="seg-max-freq" active={Boolean(filters.maxFrequency)}>
              <FilterInput id="seg-max-freq" type="number" placeholder="Maximum frequency" value={filters.maxFrequency} onChange={(event) => setFilters((f) => ({ ...f, maxFrequency: event.target.value }))} />
            </FilterItem>
            <FilterItem label="CRM segment" htmlFor="seg-crm" active={Boolean(filters.crmSegment)}>
              <FilterInput id="seg-crm" placeholder="e.g. High-value customers" value={filters.crmSegment} onChange={(event) => setFilters((f) => ({ ...f, crmSegment: event.target.value }))} />
            </FilterItem>
            <FilterItem label="Customer tag" htmlFor="seg-tag" active={Boolean(filters.tag)}>
              <FilterInput id="seg-tag" placeholder="e.g. VIP" value={filters.tag} onChange={(event) => setFilters((f) => ({ ...f, tag: event.target.value }))} />
            </FilterItem>
          </FilterGroup>
          <FilterActions>
            <FilterApplyButton>{editingId ? 'Update segment' : 'Save segment'}</FilterApplyButton>
          </FilterActions>
        </FilterBar>
        {error ? <FormErrorAlert message={error} /> : null}
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Filters</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {segments.map((segment) => (
              <TableRow key={segment.id}>
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  <Tag variant="neutral"><TagLabel>{segment.builderType}</TagLabel></Tag>
                  {Object.entries(segment.filters).map(([key, value]) => <Tag key={key} variant="outline"><TagLabel>{key}: {String(value)}</TagLabel></Tag>)}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => edit(segment)}>Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => void loadPreview(segment.id)}>Preview</Button>
                  <Button type="button" size="sm" variant="error" onClick={() => setDeleteTarget(segment)}>
                    Delete
                  </Button>
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
    </>
  );
}
