'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Eye, PackageCheck } from 'lucide-react';
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
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

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
  const { formatCurrency } = useTenantSettings();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [analytics, setAnalytics] = useState<ProcurementAnalytics | null>(null);
  const [form, setForm] = useState<PoForm>(emptyForm);
  const [receiveOrder, setReceiveOrder] = useState<PurchaseOrder | null>(null);
  const [received, setReceived] = useState<Record<string, number>>({});
  const [productSearch, setProductSearch] = useState('');
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
  const productSuggestions = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return purchasableItems.slice(0, 8);
    return purchasableItems
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.barcode?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [productSearch, purchasableItems]);
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
    <Stack gap="lg" className="min-w-0">
      {error ? <FormErrorAlert message={error} /> : null}

      {analytics ? (
        <MetricGrid columns={4}>
          <MetricCard label="Active suppliers" value={analytics.activeSuppliers} />
          <MetricCard label="Open POs" value={analytics.openPurchaseOrders} />
          <MetricCard label="Delayed orders" value={analytics.delayedOrders} />
          <MetricCard label="On-time delivery" value={`${analytics.onTimeDeliveryRate}%`} />
        </MetricGrid>
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
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value, items: [] })}>
              {suppliers.filter((supplier) => supplier.isActive).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </Select>
            <Input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PoForm['status'] })}>
              <option value="draft">Save as draft</option>
              <option value="sent">Send PO</option>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Items ordered</h3>
              <Button type="button" variant="outline" onClick={addLine} disabled={!form.supplierId}>
                Add item
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Autocomplete products by name, SKU, or barcode"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
              {productSearch.trim() && productSuggestions.length ? (
                <div className="flex flex-wrap gap-2">
                  {productSuggestions.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setForm((current) => ({
                          ...current,
                          items: [...current.items, {
                            itemId: item.id,
                            quantityOrdered: selectedSupplier?.items.find((supplierItem) => supplierItem.itemId === item.id)?.minOrderQty ?? 1,
                            costPrice: supplierCost(item.id),
                          }],
                        }));
                        setProductSearch('');
                      }}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            {form.items.map((line, index) => (
              <div key={`${line.itemId}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                <Select
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
                </Select>
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
            <span>Estimated gross cost: {formatCurrency(total)}</span>
            <Button type="button" onClick={save} disabled={!form.supplierId || !form.locationId || form.items.length === 0}>
              Save purchase order
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdminTableShell
        isEmpty={orders.length === 0}
        emptyTitle="No purchase orders"
        emptyDescription="Create a purchase order to track procurement."
      >
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Net cost</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Gross cost</TableHead>
              <TableHead>Expected delivery</TableHead>
              <TableHead className="w-[1%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.supplier?.name ?? supplierById[order.supplierId]?.name ?? 'Supplier'}</TableCell>
                <TableCell>{order.location?.name ?? order.locationId}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{formatCurrency(order.subtotalCost ?? order.totalCost)}</TableCell>
                <TableCell>{formatCurrency(order.taxTotal ?? '0.00')}</TableCell>
                <TableCell>{formatCurrency(order.totalCost)}</TableCell>
                <TableCell>{order.expectedDeliveryDate ?? 'Not set'}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label="View purchase order"
                      onClick={() => editOrder(order)}
                      disabled={['received', 'cancelled'].includes(order.status)}
                    >
                      <Eye className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label="Receive purchase order"
                      onClick={() => setReceiveOrder(order)}
                      disabled={['received', 'cancelled'].includes(order.status)}
                    >
                      <PackageCheck className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label="Cancel purchase order"
                      onClick={() => void updatePurchaseOrder(api, {
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
                      }).then(load)}
                      disabled={['received', 'cancelled'].includes(order.status)}
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
    </Stack>
  );
}


function StatusBadge({ status }: { status: PurchaseOrder['status'] }) {
  const variant: import('@/components/ui/admin-tag').TagVariant =
    status === 'received' ? 'success' : status === 'cancelled' ? 'error' : status === 'partial' ? 'warning' : 'neutral';
  return (
    <Tag variant={variant}>
      <TagLabel>{status}</TagLabel>
    </Tag>
  );
}
