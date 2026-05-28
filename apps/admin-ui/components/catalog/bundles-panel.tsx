'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Copy, Pencil, Trash2 } from 'lucide-react';
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
import {
  createCatalogBundle,
  deleteCatalogBundle,
  disableCatalogBundle,
  duplicateCatalogBundle,
  listCatalogBundles,
  listCatalogItems,
  updateCatalogBundle,
  type CatalogBundle,
  type CatalogItem,
} from '@/lib/api/catalog';
import { getErrorMessage } from '@/lib/utils';

type BundleFormItem = {
  itemId: string;
  quantity: number;
  isOptional: boolean;
  minSelect?: number;
  maxSelect?: number;
};

type BundleFormState = {
  id?: string;
  name: string;
  description: string;
  priceType: 'fixed' | 'discounted' | 'dynamic';
  fixedPrice: string;
  discountAmount: string;
  discountPercent: string;
  isActive: boolean;
  items: BundleFormItem[];
};

const emptyForm: BundleFormState = {
  name: '',
  description: '',
  priceType: 'dynamic',
  fixedPrice: '',
  discountAmount: '',
  discountPercent: '',
  isActive: true,
  items: [],
};

export function BundlesPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [bundles, setBundles] = useState<CatalogBundle[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<BundleFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextBundles, nextItems] = await Promise.all([
        listCatalogBundles(api),
        listCatalogItems(api),
      ]);
      setBundles(nextBundles);
      setItems(nextItems);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const itemById = useMemo(() => Object.fromEntries(items.map((item) => [item.id, item])), [items]);

  const editBundle = (bundle: CatalogBundle) => {
    setForm({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description ?? '',
      priceType: bundle.priceType,
      fixedPrice: bundle.fixedPrice ?? '',
      discountAmount: bundle.discountAmount ?? '',
      discountPercent: bundle.discountPercent ?? '',
      isActive: bundle.isActive,
      items: bundle.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        isOptional: item.isOptional,
        minSelect: item.minSelect ?? undefined,
        maxSelect: item.maxSelect ?? undefined,
      })),
    });
  };

  const addItemRow = () => {
    const firstItem = items[0];
    if (!firstItem) return;
    setForm((current) => ({
      ...current,
      items: [...current.items, { itemId: firstItem.id, quantity: 1, isOptional: false }],
    }));
  };

  const save = async () => {
    try {
      const body = {
        id: form.id,
        name: form.name,
        description: form.description || undefined,
        priceType: form.priceType,
        fixedPrice: form.fixedPrice ? Number(form.fixedPrice) : undefined,
        discountAmount: form.discountAmount ? Number(form.discountAmount) : undefined,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
        isActive: form.isActive,
        items: form.items.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          isOptional: item.isOptional,
          minSelect: item.isOptional ? item.minSelect : undefined,
          maxSelect: item.isOptional ? item.maxSelect : undefined,
        })),
      };
      if (form.id) {
        await updateCatalogBundle(api, body);
      } else {
        await createCatalogBundle(api, body);
      }
      setForm(emptyForm);
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{form.id ? 'Edit bundle' : 'Bundle builder'}</h2>
              <p className="text-sm text-muted-foreground">
                Build fixed, discounted, or dynamic bundles for storefront and POS.
              </p>
            </div>
            {form.id ? (
              <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
                New bundle
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Bundle name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.priceType}
              onChange={(e) => setForm({ ...form, priceType: e.target.value as BundleFormState['priceType'] })}
            >
              <option value="fixed">Fixed price</option>
              <option value="discounted">Discounted price</option>
              <option value="dynamic">Dynamic sum of items</option>
            </Select>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Fixed price" value={form.fixedPrice} onChange={(e) => setForm({ ...form, fixedPrice: e.target.value })} />
            <Input placeholder="Discount amount" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} />
            <Input placeholder="Discount percent" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Included items</h3>
              <Button type="button" variant="outline" onClick={addItemRow} disabled={items.length === 0}>
                Add item
              </Button>
            </div>
            {form.items.map((row, index) => (
              <div key={`${row.itemId}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                <Select
                  className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
                  value={row.itemId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      items: current.items.map((item, i) => (i === index ? { ...item, itemId: e.target.value } : item)),
                    }))
                  }
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      items: current.items.map((item, i) => (i === index ? { ...item, quantity: Number(e.target.value) } : item)),
                    }))
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.isOptional}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        items: current.items.map((item, i) => (i === index ? { ...item, isOptional: e.target.checked } : item)),
                      }))
                    }
                  />
                  Optional
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Preview</p>
            <p>{form.name || 'Bundle name'} · {form.priceType}</p>
            <p className="text-muted-foreground">
              {form.items.map((item) => itemById[item.itemId]?.name).filter(Boolean).join(' + ') || 'Add items to preview storefront/POS contents.'}
            </p>
          </div>

          <Button type="button" onClick={save} disabled={!form.name.trim() || form.items.length === 0}>
            Save bundle
          </Button>
        </CardContent>
      </Card>

      <AdminTableShell
        isEmpty={bundles.length === 0}
        emptyTitle="No bundles yet"
        emptyDescription="Create a bundle to sell grouped catalog items."
      >
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="w-[1%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell className="font-medium">{bundle.name}</TableCell>
                <TableCell className="capitalize">{bundle.priceType}</TableCell>
                <TableCell>
                  <Tag variant={bundle.isActive ? 'brand' : 'neutral'}><TagLabel>
                    {bundle.isActive ? 'Active' : 'Inactive'}
                  </TagLabel></Tag>
                </TableCell>
                <TableCell className="text-muted-foreground">{bundle.items.length}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Edit ${bundle.name}`}
                      onClick={() => editBundle(bundle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Duplicate ${bundle.name}`}
                      onClick={() => duplicateCatalogBundle(api, bundle.id).then(load)}
                    >
                      <Copy className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Disable ${bundle.name}`}
                      onClick={() => disableCatalogBundle(api, bundle.id).then(load)}
                    >
                      <Ban className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete ${bundle.name}`}
                      onClick={() => deleteCatalogBundle(api, bundle.id).then(load)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>
    </Stack>
  );
}
