'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  assignWarehouseBinItem,
  completePickTask,
  getWarehouseDashboard,
  listPickTasks,
  listWarehouseBins,
  listWarehouseZones,
  upsertWarehouseBin,
  upsertWarehouseZone,
  type PickTask,
  type WarehouseBin,
  type WarehouseDashboard,
  type WarehouseZone,
} from '@/lib/api/admin/warehouse';
import { listCatalogItems, type CatalogItem } from '@/lib/api/catalog';
import { getErrorMessage } from '@/lib/utils';

type ZoneForm = {
  id?: string;
  warehouseId: string;
  name: string;
  type: 'ambient' | 'chilled' | 'frozen' | 'produce' | 'bakery' | 'picking' | 'storage' | 'receiving';
};

type BinForm = {
  id?: string;
  zoneId: string;
  code: string;
  capacity: string;
};

type BinItemForm = {
  binId: string;
  itemId: string;
  quantity: string;
};

const zoneTypes = ['ambient', 'chilled', 'frozen', 'produce', 'bakery', 'picking', 'storage', 'receiving'] as const;

export function WarehouseManagementPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [dashboard, setDashboard] = useState<WarehouseDashboard | null>(null);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [picks, setPicks] = useState<PickTask[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [zoneForm, setZoneForm] = useState<ZoneForm>({ warehouseId: '', name: '', type: 'ambient' });
  const [binForm, setBinForm] = useState<BinForm>({ zoneId: '', code: '', capacity: '' });
  const [binItemForm, setBinItemForm] = useState<BinItemForm>({ binId: '', itemId: '', quantity: '0' });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextDashboard, nextLocations, nextZones, nextBins, nextPicks, nextProducts] = await Promise.all([
        getWarehouseDashboard(api),
        fetchLocations(),
        listWarehouseZones(api),
        listWarehouseBins(api),
        listPickTasks(api),
        listCatalogItems(api),
      ]);
      setDashboard(nextDashboard);
      setLocations(nextLocations);
      setZones(nextZones);
      setBins(nextBins);
      setPicks(nextPicks);
      setProducts(nextProducts);
      setError(null);
      const firstWarehouse = nextLocations.find((location) => ['warehouse', 'dark_store', 'distribution_center'].includes(location.locationType ?? ''));
      setZoneForm((current) => ({ ...current, warehouseId: current.warehouseId || firstWarehouse?.id || nextLocations[0]?.id || '' }));
      setBinForm((current) => ({ ...current, zoneId: current.zoneId || nextZones[0]?.id || '' }));
      setBinItemForm((current) => ({ ...current, binId: current.binId || nextBins[0]?.id || '', itemId: current.itemId || nextProducts[0]?.id || '' }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const warehouses = locations.filter((location) => ['warehouse', 'dark_store', 'distribution_center'].includes(location.locationType ?? ''));
  const warehouseOptions = warehouses.length ? warehouses : locations;

  const saveZone = async () => {
    try {
      await upsertWarehouseZone(api, zoneForm);
      setZoneForm({ warehouseId: zoneForm.warehouseId, name: '', type: 'ambient' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveBin = async () => {
    try {
      await upsertWarehouseBin(api, {
        ...binForm,
        capacity: binForm.capacity ? Number(binForm.capacity) : undefined,
      });
      setBinForm({ zoneId: binForm.zoneId, code: '', capacity: '' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const completePick = async (pickTaskId: string) => {
    try {
      await completePickTask(api, pickTaskId);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveBinItem = async () => {
    try {
      await assignWarehouseBinItem(api, {
        binId: binItemForm.binId,
        itemId: binItemForm.itemId,
        quantity: Number(binItemForm.quantity),
      });
      setBinItemForm({ ...binItemForm, quantity: '0' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {dashboard ? (
        <div className="grid gap-3 md:grid-cols-5">
          <MetricCard label="Warehouses" value={dashboard.warehouseCount} />
          <MetricCard label="Stock items" value={dashboard.totalStockItems} />
          <MetricCard label="Inbound" value={dashboard.inboundShipments} />
          <MetricCard label="Outbound" value={dashboard.outboundTransfers} />
          <MetricCard label="Open picks" value={dashboard.openPickTasks} />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-semibold">Zones</h2>
              <p className="text-sm text-muted-foreground">Create picking, storage, and receiving zones for warehouse stock.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={zoneForm.warehouseId} onChange={(e) => setZoneForm({ ...zoneForm, warehouseId: e.target.value })}>
                {warehouseOptions.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
              <Input placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={zoneForm.type} onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value as ZoneForm['type'] })}>
                {zoneTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={saveZone} disabled={!zoneForm.warehouseId || !zoneForm.name.trim()}>
              Save zone
            </Button>
            <div className="space-y-2">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-muted-foreground">{zone.warehouse?.name ?? zone.warehouseId} · {zone.type}</p>
                  </div>
                  <Badge variant="secondary">{zone.bins.length} bins</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-semibold">Bins</h2>
              <p className="text-sm text-muted-foreground">Assign bins to zones and review current bin contents.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={binForm.zoneId} onChange={(e) => setBinForm({ ...binForm, zoneId: e.target.value })}>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <Input placeholder="Bin code" value={binForm.code} onChange={(e) => setBinForm({ ...binForm, code: e.target.value })} />
              <Input placeholder="Capacity" type="number" value={binForm.capacity} onChange={(e) => setBinForm({ ...binForm, capacity: e.target.value })} />
            </div>
            <Button type="button" onClick={saveBin} disabled={!binForm.zoneId || !binForm.code.trim()}>
              Save bin
            </Button>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Assign product to bin</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={binItemForm.binId} onChange={(e) => setBinItemForm({ ...binItemForm, binId: e.target.value })}>
                  {bins.map((bin) => (
                    <option key={bin.id} value={bin.id}>{bin.code}</option>
                  ))}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={binItemForm.itemId} onChange={(e) => setBinItemForm({ ...binItemForm, itemId: e.target.value })}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <Input placeholder="Quantity" type="number" min="0" value={binItemForm.quantity} onChange={(e) => setBinItemForm({ ...binItemForm, quantity: e.target.value })} />
              </div>
              <Button type="button" className="mt-3" variant="outline" onClick={saveBinItem} disabled={!binItemForm.binId || !binItemForm.itemId}>
                Save assignment
              </Button>
            </div>
            <div className="space-y-2">
              {bins.map((bin) => (
                <div key={bin.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bin.code}</p>
                    <Badge variant="outline">{bin.zone?.name ?? 'Zone'}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {bin.contents.map((item) => `${item.item?.name ?? item.itemId}: ${item.quantity}`).join(', ') || 'No assigned contents'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Pick tasks</h2>
            <p className="text-sm text-muted-foreground">Pending and assigned warehouse picking work generated from stock transfers.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Warehouse</th>
                  <th className="p-3 font-medium">Reference</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Created</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {picks.map((pick) => (
                  <tr key={pick.id} className="border-t">
                    <td className="p-3">{pick.warehouse?.name ?? pick.warehouseId}</td>
                    <td className="p-3">{pick.transferId ? `Transfer ${pick.transferId.slice(0, 8)}` : pick.orderId ? `Order ${pick.orderId.slice(0, 8)}` : 'Manual'}</td>
                    <td className="p-3"><Badge variant={pick.status === 'completed' || pick.status === 'picked' ? 'default' : 'secondary'}>{pick.status}</Badge></td>
                    <td className="p-3">{new Date(pick.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Button type="button" size="sm" variant="outline" onClick={() => void completePick(pick.id)} disabled={pick.status === 'completed' || pick.status === 'picked'}>
                        Mark picked
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
