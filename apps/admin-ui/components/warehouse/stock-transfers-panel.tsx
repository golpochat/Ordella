'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, PackageCheck, Truck } from 'lucide-react';
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
import { listInventory } from '@/lib/api/admin/inventory';
import type { InventoryListItem } from '@shared-utils';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  createStockTransfer,
  listStockTransfers,
  receiveStockTransfer,
  updateStockTransfer,
  type StockTransfer,
} from '@/lib/api/admin/warehouse';
import { getErrorMessage } from '@/lib/utils';

type TransferLineForm = {
  stockItemId: string;
  quantity: number;
};

type TransferForm = {
  fromLocationId: string;
  toLocationId: string;
  status: 'draft' | 'in_transit';
  notes: string;
  lines: TransferLineForm[];
};

const emptyForm: TransferForm = {
  fromLocationId: '',
  toLocationId: '',
  status: 'draft',
  notes: '',
  lines: [],
};

export function StockTransfersPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [stockItems, setStockItems] = useState<InventoryListItem[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [form, setForm] = useState<TransferForm>(emptyForm);
  const [receiveTransfer, setReceiveTransfer] = useState<StockTransfer | null>(null);
  const [received, setReceived] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextLocations, nextTransfers] = await Promise.all([
        fetchLocations(),
        listStockTransfers(api),
      ]);
      setLocations(nextLocations);
      setTransfers(nextTransfers);
      const firstSource = nextLocations.find((location) => ['warehouse', 'dark_store', 'distribution_center'].includes(location.locationType ?? '')) ?? nextLocations[0];
      const firstDestination = nextLocations.find((location) => location.id !== firstSource?.id);
      setForm((current) => ({
        ...current,
        fromLocationId: current.fromLocationId || firstSource?.id || '',
        toLocationId: current.toLocationId || firstDestination?.id || '',
      }));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  const loadStock = useCallback(async () => {
    if (!form.fromLocationId) return;
    try {
      setStockItems(await listInventory(api, { locationId: form.fromLocationId }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api, form.fromLocationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStock();
  }, [loadStock]);

  const stockById = useMemo(() => Object.fromEntries(stockItems.map((item) => [item.id, item])), [stockItems]);

  const addLine = () => {
    const firstItem = stockItems[0];
    if (!firstItem) return;
    setForm((current) => ({
      ...current,
      lines: [...current.lines, { stockItemId: firstItem.id, quantity: 1 }],
    }));
  };

  const save = async () => {
    try {
      await createStockTransfer(api, {
        ...form,
        notes: form.notes || undefined,
        lines: form.lines.map((line) => ({
          stockItemId: line.stockItemId,
          quantity: Number(line.quantity || 1),
        })),
      });
      setForm({ ...emptyForm, fromLocationId: form.fromLocationId, toLocationId: form.toLocationId });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const markInTransit = async (transfer: StockTransfer) => {
    try {
      await updateStockTransfer(api, { id: transfer.id, status: 'in_transit' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const cancel = async (transfer: StockTransfer) => {
    try {
      await updateStockTransfer(api, { id: transfer.id, status: 'cancelled' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const receive = async () => {
    if (!receiveTransfer) return;
    try {
      await receiveStockTransfer(api, {
        transferId: receiveTransfer.id,
        lines: receiveTransfer.lines.map((line) => ({
          transferLineId: line.id,
          quantityReceived: Number(received[line.id] ?? line.quantitySent),
        })),
      });
      setReceiveTransfer(null);
      setReceived({});
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Transfer creator</h2>
            <p className="text-sm text-muted-foreground">Move warehouse stock between stores, warehouses, dark stores, and distribution centers.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.fromLocationId} onChange={(e) => setForm({ ...form, fromLocationId: e.target.value, lines: [] })}>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </Select>
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.toLocationId} onChange={(e) => setForm({ ...form, toLocationId: e.target.value })}>
              {locations.filter((location) => location.id !== form.fromLocationId).map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </Select>
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TransferForm['status'] })}>
              <option value="draft">Save as draft</option>
              <option value="in_transit">Mark in transit</option>
            </Select>
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Items</h3>
              <Button type="button" variant="outline" onClick={addLine} disabled={stockItems.length === 0}>
                Add item
              </Button>
            </div>
            {form.lines.map((line, index) => (
              <div key={`${line.stockItemId}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
                <Select className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2" value={line.stockItemId} onChange={(e) => setForm((current) => ({
                  ...current,
                  lines: current.lines.map((item, i) => (i === index ? { ...item, stockItemId: e.target.value } : item)),
                }))}>
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} · available {item.quantityAvailable}</option>
                  ))}
                </Select>
                <Input type="number" min={1} value={line.quantity} onChange={(e) => setForm((current) => ({
                  ...current,
                  lines: current.lines.map((item, i) => (i === index ? { ...item, quantity: Number(e.target.value) } : item)),
                }))} />
                <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, lines: current.lines.filter((_, i) => i !== index) }))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={save} disabled={!form.fromLocationId || !form.toLocationId || form.lines.length === 0}>
            Save transfer
          </Button>
        </CardContent>
      </Card>

      <AdminTableShell
        isEmpty={transfers.length === 0}
        emptyTitle="No stock transfers"
        emptyDescription="Create a transfer to move stock between locations."
      >
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>From → To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[1%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">
                  {transfer.fromLocationName ?? transfer.fromLocationId} → {transfer.toLocationName ?? transfer.toLocationId}
                </TableCell>
                <TableCell>
                  <TransferStatusBadge status={transfer.status} />
                </TableCell>
                <TableCell>
                  {transfer.lines.map((line) => `${line.itemName ?? stockById[line.stockItemId]?.name ?? line.stockItemId}: ${line.quantityRequested}`).join(', ')}
                </TableCell>
                <TableCell>{new Date(transfer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label="Mark transfer in transit"
                      onClick={() => void markInTransit(transfer)}
                      disabled={!['draft', 'pending'].includes(transfer.status)}
                    >
                      <Truck className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label="Receive transfer"
                      onClick={() => setReceiveTransfer(transfer)}
                      disabled={transfer.status !== 'in_transit'}
                    >
                      <PackageCheck className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label="Cancel transfer"
                      onClick={() => void cancel(transfer)}
                      disabled={['received', 'completed', 'cancelled'].includes(transfer.status)}
                    >
                      <Ban className="h-4 w-4" />
                    </IconButton>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>

      {receiveTransfer ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Receive transfer</h2>
                <p className="text-sm text-muted-foreground">Enter received quantities. Discrepancies stay visible in sent vs received totals.</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setReceiveTransfer(null)}>Close</Button>
            </div>
            {receiveTransfer.lines.map((line) => {
              const remaining = Number(line.quantitySent) - Number(line.quantityReceived);
              return (
                <div key={line.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <p className="font-medium">{line.itemName ?? line.stockItemId}</p>
                    <p className="text-sm text-muted-foreground">Sent {line.quantitySent}, received {line.quantityReceived}, remaining {remaining.toFixed(4)}</p>
                  </div>
                  <Input type="number" min={0} max={remaining} value={received[line.id] ?? remaining} onChange={(e) => setReceived((current) => ({ ...current, [line.id]: Number(e.target.value) }))} />
                </div>
              );
            })}
            <Button type="button" onClick={receive}>Receive stock</Button>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

function TransferStatusBadge({ status }: { status: StockTransfer['status'] }) {
  const variant: import('@/components/ui/admin-tag').TagVariant =
    status === 'received' || status === 'completed'
      ? 'success'
      : status === 'cancelled'
        ? 'error'
        : status === 'in_transit'
          ? 'info'
          : 'neutral';
  return (
    <Tag variant={variant}>
      <TagLabel>{status}</TagLabel>
    </Tag>
  );
}
