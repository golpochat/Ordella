'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InventorySyncLog, MultiStoreInventoryItem } from '@shared-utils';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  createInventorySnapshot,
  listInventorySyncLogs,
  listMultiStoreInventory,
  runInventorySync,
} from '@/lib/api/admin/inventory';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

export function MultiStoreInventoryPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [rows, setRows] = useState<MultiStoreInventoryItem[]>([]);
  const [logs, setLogs] = useState<InventorySyncLog[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [locationId, setLocationId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextRows, nextLogs, nextLocations] = await Promise.all([
        listMultiStoreInventory(api, { locationId: locationId || undefined, search: search || undefined }),
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
  }, [api, locationId, search]);

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
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-5">
        <MetricCard label="Stock rows" value={metrics.total} />
        <MetricCard label="Warehouse rows" value={metrics.warehouseRows} />
        <MetricCard label="Low stock" value={metrics.low} />
        <MetricCard label="Out of stock" value={metrics.out} />
        <MetricCard label="Discrepancies" value={metrics.discrepancies} />
      </div>

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

          <div className="grid gap-3 md:grid-cols-3">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            <Input placeholder="Search item or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Item</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">On hand</th>
                  <th className="p-3 font-medium">Reserved</th>
                  <th className="p-3 font-medium">ATS</th>
                  <th className="p-3 font-medium">Reorder</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Synced</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.sku}</p>
                    </td>
                    <td className="p-3">
                      <p>{row.locationName}</p>
                      <p className="text-xs text-muted-foreground">{row.locationType}</p>
                    </td>
                    <td className="p-3">{row.quantityOnHand}</td>
                    <td className="p-3">{row.quantityReserved}</td>
                    <td className="p-3">{row.availableToSell}</td>
                    <td className="p-3">{row.reorderPoint ?? 'Not set'}</td>
                    <td className="p-3">
                      <InventoryStatusBadge status={row.status} discrepancy={row.discrepancy} />
                    </td>
                    <td className="p-3">{row.lastSyncedAt ? row.lastSyncedAt.toLocaleString() : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function InventoryStatusBadge({ status, discrepancy }: { status: string; discrepancy?: string | null }) {
  if (discrepancy) return <Badge variant="outline">{discrepancy}</Badge>;
  const variant: 'default' | 'secondary' | 'destructive' = status === 'out' ? 'destructive' : status === 'low' ? 'secondary' : 'default';
  return <Badge variant={variant}>{status}</Badge>;
}
