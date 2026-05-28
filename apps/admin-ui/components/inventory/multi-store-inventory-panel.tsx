'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InventorySyncLog, MultiStoreInventoryItem } from '@shared-utils';
import { Button, Card, CardContent , Stack } from '@shared-ui';
import {
  AdminTableShell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  createInventorySnapshot,
  listInventorySyncLogs,
  listMultiStoreInventory,
  runInventorySync,
} from '@/lib/api/admin/inventory';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import {
  FilterBar,
  FilterGroup,
  FilterItem,
  FilterSelect,
} from '@/components/ui/admin-filter';
import { SearchInput, useDebouncedSearchValue } from '@/components/ui/admin-search';

export function MultiStoreInventoryPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [rows, setRows] = useState<MultiStoreInventoryItem[]>([]);
  const [logs, setLogs] = useState<InventorySyncLog[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [locationId, setLocationId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedSearchValue(search, 300);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextRows, nextLogs, nextLocations] = await Promise.all([
        listMultiStoreInventory(api, { locationId: locationId || undefined, search: debouncedSearch || undefined }),
        listInventorySyncLogs(api),
        fetchLocations(),
      ]);
      setRows(nextRows);
      setLogs(nextLogs);
      setLocations(nextLocations);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api, locationId, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => ({
    total: rows.length,
    low: rows.filter((row) => row.status === 'low').length,
    out: rows.filter((row) => row.status === 'out').length,
    discrepancies: rows.filter((row) => row.discrepancy).length,
    warehouseRows: rows.filter((row) => ['warehouse', 'dark_store', 'distribution_center'].includes(row.locationType)).length,
  }), [rows]);

  const syncNow = async () => {
    try {
      await runInventorySync(api, { toLocationId: locationId || undefined, reason: 'auto-sync' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const snapshot = async () => {
    try {
      await createInventorySnapshot(api, { locationId: locationId || undefined, label: 'Manual multi-store snapshot' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      <MetricGrid columns={5}>
        <MetricCard label="Stock rows" value={metrics.total} />
        <MetricCard label="Warehouse rows" value={metrics.warehouseRows} />
        <MetricCard label="Low stock" value={metrics.low} />
        <MetricCard label="Out of stock" value={metrics.out} />
        <MetricCard label="Discrepancies" value={metrics.discrepancies} />
      </MetricGrid>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Multi-store stock visibility</h2>
              <p className="text-sm text-muted-foreground">
                Review available-to-sell, reserved, warehouse, and store stock across all locations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={snapshot}>Create snapshot</Button>
              <Button type="button" onClick={syncNow}>Trigger sync</Button>
            </div>
          </div>

          <FilterBar as="div">
            <FilterGroup columns={2}>
              <FilterItem label="Location" htmlFor="multi-store-location" active={Boolean(locationId)}>
                <FilterSelect
                  id="multi-store-location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  <option value="">All locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
              <FilterItem label="Search" htmlFor="multi-store-search" active={Boolean(search)}>
                <SearchInput
                  id="multi-store-search"
                  placeholder="Search item or SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  active={Boolean(search)}
                  aria-label="Search multi-store inventory"
                />
              </FilterItem>
            </FilterGroup>
          </FilterBar>

          <AdminTableShell
            isEmpty={rows.length === 0}
            emptyTitle="No inventory rows"
            emptyDescription="Stock levels will appear here once items are synced."
          >
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>On hand</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>ATS</TableHead>
                  <TableHead>Reorder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Synced</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.sku}</p>
                    </TableCell>
                    <TableCell>
                      <p>{row.locationName}</p>
                      <p className="text-xs text-muted-foreground">{row.locationType}</p>
                    </TableCell>
                    <TableCell>{row.quantityOnHand}</TableCell>
                    <TableCell>{row.quantityReserved}</TableCell>
                    <TableCell>{row.availableToSell}</TableCell>
                    <TableCell>{row.reorderPoint ?? 'Not set'}</TableCell>
                    <TableCell>
                      <InventoryStatusBadge status={row.status} discrepancy={row.discrepancy} />
                    </TableCell>
                    <TableCell>{row.lastSyncedAt ? row.lastSyncedAt.toLocaleString() : 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Recent sync activity</h2>
            <p className="text-sm text-muted-foreground">Transfers, receiving, adjustments, and manual sync events.</p>
          </div>
          <div className="space-y-2">
            {logs.slice(0, 12).map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{log.reason}</p>
                  <p className="text-muted-foreground">
                    {log.fromLocationId ?? 'System'} → {log.toLocationId ?? 'All locations'} · qty {log.quantity}
                  </p>
                </div>
                <span className="text-muted-foreground">{log.createdAt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Stack>
  );
}


function InventoryStatusBadge({ status, discrepancy }: { status: string; discrepancy?: string | null }) {
  if (discrepancy) {
    return (
      <Tag variant="warning">
        <TagLabel>{discrepancy}</TagLabel>
      </Tag>
    );
  }
  const variant: import('@/components/ui/admin-tag').TagVariant =
    status === 'out' ? 'error' : status === 'low' ? 'warning' : 'success';
  return (
    <Tag variant={variant}>
      <TagLabel>{status}</TagLabel>
    </Tag>
  );
}
