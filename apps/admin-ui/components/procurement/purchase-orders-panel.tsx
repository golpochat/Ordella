'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { listCatalogItems, type CatalogItem } from '@/lib/api/catalog';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  createPurchaseOrder,
  getProcurementAnalytics,
  listPurchaseOrders,
  listSuppliers,
  receivePurchaseOrder,
  updatePurchaseOrder,
  type ProcurementAnalytics,
  type PurchaseOrder,
  type Supplier,
} from '@/lib/api/admin/procurement';
import { getErrorMessage } from '@/lib/utils';

type PoLineForm = {
  itemId: string;
  quantityOrdered: number;
  costPrice: string;
};

type PoForm = {
  id?: string;
  supplierId: string;
  locationId: string;
  status: 'draft' | 'sent';
  expectedDeliveryDate: string;
  items: PoLineForm[];
};

const emptyForm: PoForm = {
  supplierId: '',
  locationId: '',
  status: 'draft',
  expectedDeliveryDate: '',
  items: [],
};

export function PurchaseOrdersPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [analytics, setAnalytics] = useState<ProcurementAnalytics | null>(null);
  const [form, setForm] = useState<PoForm>(emptyForm);
  const [receiveOrder, setReceiveOrder] = useState<PurchaseOrder | null>(null);
  const [received, setReceived] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextOrders, nextSuppliers, nextItems, nextLocations, nextAnalytics] = await Promise.all([
        listPurchaseOrders(api),
        listSuppliers(api),
        listCatalogItems(api),
        fetchLocations(),
        getProcurementAnalytics(api),
      ]);
      setOrders(nextOrders);
      setSuppliers(nextSuppliers);
      setCatalogItems(nextItems);
      setLocations(nextLocations);
      setAnalytics(nextAnalytics);
      setError(null);
      setForm((current) => ({
        ...current,
        supplierId: current.supplierId || nextSuppliers[0]?.id || '',
        locationId: current.locationId || nextLocations[0]?.id || '',
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const supplierById = useMemo(() => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);
  const itemById = useMemo(() => Object.fromEntries(catalogItems.map((item) => [item.id, item])), [catalogItems]);

  const selectedSupplier = supplierById[form.supplierId];
  const purchasableItems = selectedSupplier?.items.length
    ? selectedSupplier.items.map((item) => itemById[item.itemId]).filter((item): item is CatalogItem => Boolean(item))
    : catalogItems;
  const total = form.items.reduce((sum, item) => sum + item.quantityOrdered * Number(item.costPrice || 0), 0);

  const supplierCost = (itemId: string) => {
    const match = selectedSupplier?.items.find((item) => item.itemId === itemId);
    return match?.costPrice ?? '0';
  };

  const addLine = () => {
    const firstSupplierItem = selectedSupplier?.items[0];
    const firstItem = purchasableItems[0];
    if (!firstItem) return;
    setForm((current) => ({
      ...current,
      items: [...current.items, {
        itemId: firstItem.id,
        quantityOrdered: firstSupplierItem?.minOrderQty ?? 1,
        costPrice: firstSupplierItem?.costPrice ?? '0',
      }],
    }));
  };

  const save = async () => {
    try {
      const body = {
        id: form.id,
        supplierId: form.supplierId,
        locationId: form.locationId,
        status: form.status,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        items: form.items.map((item) => ({
          itemId: item.itemId,
          quantityOrdered: Number(item.quantityOrdered || 1),
          costPrice: Number(item.costPrice || 0),
        })),
      };
      if (form.id) {
        await updatePurchaseOrder(api, body);
      } else {
        await createPurchaseOrder(api, body);
      }
      setForm({ ...emptyForm, supplierId: suppliers[0]?.id ?? '', locationId: locations[0]?.id ?? '' });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editOrder = (order: PurchaseOrder) => {
    setForm({
      id: order.id,
      supplierId: order.supplierId,
      locationId: order.locationId,
      status: order.status === 'sent' ? 'sent' : 'draft',
      expectedDeliveryDate: order.expectedDeliveryDate ?? '',
      items: order.items.map((item) => ({
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        costPrice: item.costPrice,
      })),
    });
  };

  const receive = async () => {
    if (!receiveOrder) return;
    try {
      await receivePurchaseOrder(api, {
        purchaseOrderId: receiveOrder.id,
        items: receiveOrder.items.map((item) => ({
          purchaseOrderItemId: item.id,
          quantityReceived: Number(received[item.id] || 0),
        })),
      });
      setReceiveOrder(null);
      setReceived({});
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {analytics ? (
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Active suppliers" value={analytics.activeSuppliers} />
          <MetricCard label="Open POs" value={analytics.openPurchaseOrders} />
          <MetricCard label="Delayed orders" value={analytics.delayedOrders} />
          <MetricCard label="On-time delivery" value={`${analytics.onTimeDeliveryRate}%`} />
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{form.id ? 'Edit purchase order' : 'Create purchase order'}</h2>
              <p className="text-sm text-muted-foreground">
                Select a supplier and location, add items, and save as draft or send for purchasing.
              </p>
            </div>
            {form.id ? (
              <Button type="button" variant="outline" onClick={() => setForm({ ...emptyForm, supplierId: suppliers[0]?.id ?? '', locationId: locations[0]?.id ?? '' })}>
                New PO
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value, items: [] })}>
              {suppliers.filter((supplier) => supplier.isActive).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            <Input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PoForm['status'] })}>
              <option value="draft">Save as draft</option>
              <option value="sent">Send PO</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Items ordered</h3>
              <Button type="button" variant="outline" onClick={addLine} disabled={!form.supplierId}>
                Add item
              </Button>
            </div>
            {form.items.map((line, index) => (
              <div key={`${line.itemId}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
                  value={line.itemId}
                  onChange={(e) => {
                    const itemId = e.target.value;
                    setForm((current) => ({
                      ...current,
                      items: current.items.map((item, i) => (i === index ? { ...item, itemId, costPrice: supplierCost(itemId) } : item)),
                    }));
                  }}
                >
                  {purchasableItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Input type="number" min={1} value={line.quantityOrdered} onChange={(e) => setForm((current) => ({
                  ...current,
                  items: current.items.map((item, i) => (i === index ? { ...item, quantityOrdered: Number(e.target.value) } : item)),
                }))} />
                <Input type="number" min={0} value={line.costPrice} onChange={(e) => setForm((current) => ({
                  ...current,
                  items: current.items.map((item, i) => (i === index ? { ...item, costPrice: e.target.value } : item)),
                }))} />
                <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
            <span>Total cost: £{total.toFixed(2)}</span>
            <Button type="button" onClick={save} disabled={!form.supplierId || !form.locationId || form.items.length === 0}>
              Save purchase order
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Supplier</th>
              <th className="p-3 font-medium">Location</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Total cost</th>
              <th className="p-3 font-medium">Expected delivery</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3 font-medium">{order.supplier?.name ?? supplierById[order.supplierId]?.name ?? 'Supplier'}</td>
                <td className="p-3">{order.location?.name ?? order.locationId}</td>
                <td className="p-3"><StatusBadge status={order.status} /></td>
                <td className="p-3">£{Number(order.totalCost).toFixed(2)}</td>
                <td className="p-3">{order.expectedDeliveryDate ?? 'Not set'}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editOrder(order)} disabled={['received', 'cancelled'].includes(order.status)}>
                      View
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setReceiveOrder(order)} disabled={['received', 'cancelled'].includes(order.status)}>
                      Receive
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void updatePurchaseOrder(api, {
                      id: order.id,
                      supplierId: order.supplierId,
                      locationId: order.locationId,
                      status: 'cancelled',
                      expectedDeliveryDate: order.expectedDeliveryDate ?? undefined,
                      items: order.items.map((item) => ({
                        itemId: item.itemId,
                        quantityOrdered: item.quantityOrdered,
                        costPrice: Number(item.costPrice),
                      })),
                    }).then(load)} disabled={['received', 'cancelled'].includes(order.status)}>
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receiveOrder ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Receive purchase order</h2>
                <p className="text-sm text-muted-foreground">
                  Enter received quantities. Partial receipts keep the PO open and update inventory for received units only.
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setReceiveOrder(null)}>Close</Button>
            </div>
            {receiveOrder.items.map((item) => {
              const remaining = item.quantityOrdered - item.quantityReceived;
              return (
                <div key={item.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <p className="font-medium">{item.item?.name ?? itemById[item.itemId]?.name ?? item.itemId}</p>
                    <p className="text-sm text-muted-foreground">
                      Ordered {item.quantityOrdered}, received {item.quantityReceived}, remaining {remaining}
                    </p>
                  </div>
                  <Input type="number" min={0} max={remaining} value={received[item.id] ?? 0} onChange={(e) => setReceived((current) => ({ ...current, [item.id]: Number(e.target.value) }))} />
                </div>
              );
            })}
            <Button type="button" onClick={receive}>
              Receive items
            </Button>
          </CardContent>
        </Card>
      ) : null}
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

function StatusBadge({ status }: { status: PurchaseOrder['status'] }) {
  const variant: 'default' | 'secondary' | 'destructive' | 'outline' =
    status === 'received' ? 'default' : status === 'cancelled' ? 'destructive' : status === 'partial' ? 'outline' : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}
