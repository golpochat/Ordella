'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { listCatalogItems, type CatalogItem } from '@/lib/api/catalog';
import {
  createSupplier,
  disableSupplier,
  listSuppliers,
  updateSupplier,
  type Supplier,
} from '@/lib/api/admin/procurement';
import { getErrorMessage } from '@/lib/utils';

type SupplierItemForm = {
  itemId: string;
  costPrice: string;
  sku: string;
  leadTimeDays: number;
  minOrderQty: number;
};

type SupplierForm = {
  id?: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  portalUserEmail: string;
  portalPassword: string;
  isActive: boolean;
  items: SupplierItemForm[];
};

const emptyForm: SupplierForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  portalUserEmail: '',
  portalPassword: '',
  isActive: true,
  items: [],
};

export function SuppliersPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextSuppliers, nextItems] = await Promise.all([
        listSuppliers(api),
        listCatalogItems(api),
      ]);
      setSuppliers(nextSuppliers);
      setCatalogItems(nextItems);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const itemById = useMemo(
    () => Object.fromEntries(catalogItems.map((item) => [item.id, item])),
    [catalogItems],
  );

  const editSupplier = (supplier: Supplier) => {
    setForm({
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
      portalUserEmail: supplier.portalUserEmail ?? '',
      portalPassword: '',
      isActive: supplier.isActive,
      items: supplier.items.map((item) => ({
        itemId: item.itemId,
        costPrice: item.costPrice,
        sku: item.sku ?? '',
        leadTimeDays: item.leadTimeDays,
        minOrderQty: item.minOrderQty,
      })),
    });
  };

  const addItem = () => {
    const firstItem = catalogItems[0];
    if (!firstItem) return;
    setForm((current) => ({
      ...current,
      items: [...current.items, {
        itemId: firstItem.id,
        costPrice: '0',
        sku: firstItem.sku ?? '',
        leadTimeDays: 0,
        minOrderQty: 1,
      }],
    }));
  };

  const save = async () => {
    try {
      const body = {
        id: form.id,
        name: form.name,
        contactName: form.contactName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
        portalUserEmail: form.portalUserEmail || undefined,
        portalPassword: form.portalPassword || undefined,
        isActive: form.isActive,
        items: form.items.map((item) => ({
          itemId: item.itemId,
          costPrice: Number(item.costPrice || 0),
          sku: item.sku || undefined,
          leadTimeDays: Number(item.leadTimeDays || 0),
          minOrderQty: Number(item.minOrderQty || 1),
        })),
      };
      if (form.id) {
        await updateSupplier(api, body);
      } else {
        await createSupplier(api, body);
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{form.id ? 'Edit supplier' : 'Supplier editor'}</h2>
              <p className="text-sm text-muted-foreground">
                Manage supplier contacts, supplied catalog items, cost pricing, SKUs, and lead times.
              </p>
            </div>
            {form.id ? (
              <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
                New supplier
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Input placeholder="Supplier portal login email" value={form.portalUserEmail} onChange={(e) => setForm({ ...form, portalUserEmail: e.target.value })} />
            <Input placeholder="Portal password / reset password" type="password" value={form.portalPassword} onChange={(e) => setForm({ ...form, portalPassword: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Items supplied</h3>
              <Button type="button" variant="outline" onClick={addItem} disabled={catalogItems.length === 0}>
                Add item
              </Button>
            </div>
            {form.items.map((row, index) => (
              <div key={`${row.itemId}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-6">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
                  value={row.itemId}
                  onChange={(e) => setForm((current) => ({
                    ...current,
                    items: current.items.map((item, i) => (i === index ? { ...item, itemId: e.target.value } : item)),
                  }))}
                >
                  {catalogItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Input placeholder="Cost" type="number" value={row.costPrice} onChange={(e) => setForm((current) => ({
                  ...current,
                  items: current.items.map((item, i) => (i === index ? { ...item, costPrice: e.target.value } : item)),
                }))} />
                <Input placeholder="Supplier SKU" value={row.sku} onChange={(e) => setForm((current) => ({
                  ...current,
                  items: current.items.map((item, i) => (i === index ? { ...item, sku: e.target.value } : item)),
                }))} />
                <Input placeholder="Lead days" type="number" value={row.leadTimeDays} onChange={(e) => setForm((current) => ({
                  ...current,
                  items: current.items.map((item, i) => (i === index ? { ...item, leadTimeDays: Number(e.target.value) } : item)),
                }))} />
                <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" onClick={save} disabled={!form.name.trim()}>
            Save supplier
          </Button>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Items supplied</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Portal</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t">
                <td className="p-3 font-medium">{supplier.name}</td>
                <td className="p-3 text-muted-foreground">
                  {supplier.contactName || supplier.email || supplier.phone || 'No contact'}
                </td>
                <td className="p-3">
                  {supplier.items.map((item) => item.item?.name ?? itemById[item.itemId]?.name ?? item.itemId).join(', ') || 'No mapped items'}
                </td>
                <td className="p-3">
                  <Badge variant={supplier.isActive ? 'default' : 'secondary'}>{supplier.isActive ? 'Active' : 'Disabled'}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant={supplier.portalUserEmail ? 'default' : 'secondary'}>
                    {supplier.portalUserEmail ? 'Enabled' : 'Off'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editSupplier(supplier)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void disableSupplier(api, supplier.id).then(load)}>
                      Disable
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
