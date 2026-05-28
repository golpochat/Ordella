'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Select, Button, Card, CardContent, IconButton, Input , Stack } from '@shared-ui';
import {
  AdminTableShell,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
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
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

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
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      {dashboard ? (
        <MetricGrid columns={5}>
          <MetricCard label="Warehouses" value={dashboard.warehouseCount} />
          <MetricCard label="Stock items" value={dashboard.totalStockItems} />
          <MetricCard label="Inbound" value={dashboard.inboundShipments} />
          <MetricCard label="Outbound" value={dashboard.outboundTransfers} />
          <MetricCard label="Open picks" value={dashboard.openPickTasks} />
        </MetricGrid>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-lg font-semibold">Zones</h2>
              <p className="text-sm text-muted-foreground">Create picking, storage, and receiving zones for warehouse stock.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={zoneForm.warehouseId} onChange={(e) => setZoneForm({ ...zoneForm, warehouseId: e.target.value })}>
                {warehouseOptions.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </Select>
              <Input placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
              <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={zoneForm.type} onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value as ZoneForm['type'] })}>
                {zoneTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </Select>
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
                  <Tag variant="neutral"><TagLabel>{zone.bins.length} bins</TagLabel></Tag>
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
              <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={binForm.zoneId} onChange={(e) => setBinForm({ ...binForm, zoneId: e.target.value })}>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </Select>
              <Input placeholder="Bin code" value={binForm.code} onChange={(e) => setBinForm({ ...binForm, code: e.target.value })} />
              <Input placeholder="Capacity" type="number" value={binForm.capacity} onChange={(e) => setBinForm({ ...binForm, capacity: e.target.value })} />
            </div>
            <Button type="button" onClick={saveBin} disabled={!binForm.zoneId || !binForm.code.trim()}>
              Save bin
            </Button>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Assign product to bin</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={binItemForm.binId} onChange={(e) => setBinItemForm({ ...binItemForm, binId: e.target.value })}>
                  {bins.map((bin) => (
                    <option key={bin.id} value={bin.id}>{bin.code}</option>
                  ))}
                </Select>
                <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={binItemForm.itemId} onChange={(e) => setBinItemForm({ ...binItemForm, itemId: e.target.value })}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </Select>
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
                    <Tag variant="outline"><TagLabel>{bin.zone?.name ?? 'Zone'}</TagLabel></Tag>
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
          <AdminTableShell
            isEmpty={picks.length === 0}
            emptyTitle="No pick tasks"
            emptyDescription="Warehouse picking work will appear here."
          >
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[1%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {picks.map((pick) => (
                  <TableRow key={pick.id}>
                    <TableCell>{pick.warehouse?.name ?? pick.warehouseId}</TableCell>
                    <TableCell>
                      {pick.transferId ? `Transfer ${pick.transferId.slice(0, 8)}` : pick.orderId ? `Order ${pick.orderId.slice(0, 8)}` : 'Manual'}
                    </TableCell>
                    <TableCell>
                      <Tag variant={pick.status === 'completed' || pick.status === 'picked' ? 'brand' : 'neutral'}><TagLabel>{pick.status}</TagLabel></Tag>
                    </TableCell>
                    <TableCell>{new Date(pick.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <TableActions>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label="Mark pick task as picked"
                          onClick={() => void completePick(pick.id)}
                          disabled={pick.status === 'completed' || pick.status === 'picked'}
                        >
                          <Check className="h-4 w-4" />
                        </IconButton>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>
    </Stack>
  );
}

