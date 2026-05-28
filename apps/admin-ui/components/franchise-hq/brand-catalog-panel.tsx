'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useEffect, useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input , Stack } from '@shared-ui';
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
  createGlobalCatalogCategory,
  createGlobalCatalogItem,
  listGlobalCatalogCategories,
  listGlobalCatalogItems,
  listLocalBrandCatalog,
  overrideLocalBrandItem,
  resetLocalBrandOverride,
  type BrandGlobalCategory,
  type BrandGlobalItem,
  type BrandLocalItem,
} from '@/lib/api/admin/brand-catalog';
import { getErrorMessage } from '@/lib/utils';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

type GlobalItemDraft = {
  name: string;
  description: string;
  basePrice: string;
  sku: string;
  barcode: string;
  globalCategoryId: string;
  attributesJson: string;
};

const EMPTY_GLOBAL_ITEM: GlobalItemDraft = {
  name: '',
  description: '',
  basePrice: '0.00',
  sku: '',
  barcode: '',
  globalCategoryId: '',
  attributesJson: '{}',
};

export function BrandCatalogPanel({
  initialGlobalItems,
  initialGlobalCategories,
  initialLocalItems,
}: {
  initialGlobalItems: BrandGlobalItem[];
  initialGlobalCategories: BrandGlobalCategory[];
  initialLocalItems: BrandLocalItem[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const [globalItems, setGlobalItems] = useState(initialGlobalItems);
  const [globalCategories, setGlobalCategories] = useState(initialGlobalCategories);
  const [localItems, setLocalItems] = useState(initialLocalItems);
  const [categoryName, setCategoryName] = useState('');
  const [itemDraft, setItemDraft] = useState<GlobalItemDraft>(EMPTY_GLOBAL_ITEM);
  const [overrideDraft, setOverrideDraft] = useState<Record<string, { price: string; name: string; isActive: boolean }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const drafts: Record<string, { price: string; name: string; isActive: boolean }> = {};
    for (const item of localItems) {
      if (!item.globalItemId) continue;
      drafts[item.id] = {
        price: item.catalogSource === 'overridden' ? item.price : '',
        name: item.catalogSource === 'overridden' ? item.name : '',
        isActive: item.isActive,
      };
    }
    setOverrideDraft(drafts);
  }, [localItems]);

  async function refresh() {
    const [nextGlobalItems, nextGlobalCategories, nextLocalItems] = await Promise.all([
      listGlobalCatalogItems(api),
      listGlobalCatalogCategories(api),
      listLocalBrandCatalog(api),
    ]);
    setGlobalItems(nextGlobalItems);
    setGlobalCategories(nextGlobalCategories);
    setLocalItems(nextLocalItems);
  }

  async function run(action: () => Promise<void>, success: string) {
    setLoading(true);
    try {
      await action();
      toastSuccess(success);
      await refresh();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function addCategory() {
    if (!categoryName.trim()) return;
    await run(async () => {
      await createGlobalCatalogCategory(api, { name: categoryName.trim(), sortOrder: globalCategories.length });
      setCategoryName('');
    }, 'Global category saved');
  }

  async function addGlobalItem() {
    if (!itemDraft.name.trim()) return;
    await run(async () => {
      const attributes = JSON.parse(itemDraft.attributesJson || '{}') as Record<string, unknown>;
      await createGlobalCatalogItem(api, {
        name: itemDraft.name,
        description: itemDraft.description || undefined,
        basePrice: itemDraft.basePrice,
        sku: itemDraft.sku || undefined,
        barcode: itemDraft.barcode || undefined,
        globalCategoryId: itemDraft.globalCategoryId || undefined,
        attributes,
        isActive: true,
      });
      setItemDraft(EMPTY_GLOBAL_ITEM);
    }, 'Global item saved');
  }

  async function saveOverride(item: BrandLocalItem) {
    const draft = overrideDraft[item.id];
    if (!item.globalItemId || !draft) return;
    await run(async () => {
      await overrideLocalBrandItem(api, {
        localItemId: item.id,
        globalItemId: item.globalItemId,
        overridePrice: draft.price || undefined,
        overrideName: draft.name || undefined,
        isActive: draft.isActive,
      });
    }, 'Override saved');
  }

  const inheritedItems = localItems.filter((item) => item.globalItemId);
  const localOnlyItems = localItems.filter((item) => !item.globalItemId);

  return (
    <Stack gap="lg" className="min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>Global categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            <Button type="button" disabled={loading} onClick={addCategory}>Add category</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {globalCategories.map((category) => (
              <div key={category.id} className="rounded-lg border p-3">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">Order {category.sortOrder}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder="Catalog item name" value={itemDraft.name} onChange={(e) => setItemDraft({ ...itemDraft, name: e.target.value })} />
            <Input placeholder="Base price" value={itemDraft.basePrice} onChange={(e) => setItemDraft({ ...itemDraft, basePrice: e.target.value })} />
            <Input placeholder="SKU" value={itemDraft.sku} onChange={(e) => setItemDraft({ ...itemDraft, sku: e.target.value })} />
            <Input placeholder="Barcode" value={itemDraft.barcode} onChange={(e) => setItemDraft({ ...itemDraft, barcode: e.target.value })} />
            <Select className="h-10 rounded-md border border-border-default bg-background px-3" value={itemDraft.globalCategoryId} onChange={(e) => setItemDraft({ ...itemDraft, globalCategoryId: e.target.value })}>
              <option value="">No global category</option>
              {globalCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
            <Input placeholder='Attributes JSON, e.g. {"size":"large"}' value={itemDraft.attributesJson} onChange={(e) => setItemDraft({ ...itemDraft, attributesJson: e.target.value })} />
          </div>
          <Input placeholder="Description" value={itemDraft.description} onChange={(e) => setItemDraft({ ...itemDraft, description: e.target.value })} />
          <Button type="button" disabled={loading} onClick={addGlobalItem}>Create global item</Button>
          <AdminTableShell
            isEmpty={globalItems.length === 0}
            emptyTitle="No global items"
            emptyDescription="Create a global catalog item to share across brands."
          >
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base price</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {globalItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {globalCategories.find((category) => category.id === item.globalCategoryId)?.name ?? '—'}
                    </TableCell>
                    <TableCell>{item.basePrice}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku ?? '—'}</TableCell>
                    <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inheritedItems.map((item) => {
            const draft = overrideDraft[item.id] ?? { price: '', name: '', isActive: item.isActive };
            return (
              <div key={item.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                <div>
                  <p className="font-medium">{item.baseName ?? item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.catalogSource}</p>
                </div>
                <Input placeholder={`Price (${item.basePrice ?? item.price})`} value={draft.price} onChange={(e) => setOverrideDraft({ ...overrideDraft, [item.id]: { ...draft, price: e.target.value } })} />
                <Input placeholder="Override name" value={draft.name} onChange={(e) => setOverrideDraft({ ...overrideDraft, [item.id]: { ...draft, name: e.target.value } })} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.isActive} onChange={(e) => setOverrideDraft({ ...overrideDraft, [item.id]: { ...draft, isActive: e.target.checked } })} />
                  Available
                </label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" disabled={loading} onClick={() => saveOverride(item)}>Save</Button>
                  <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => run(() => resetLocalBrandOverride(api, item.id).then(() => undefined), 'Override reset')}>Reset</Button>
                </div>
              </div>
            );
          })}
          {inheritedItems.length === 0 ? <PanelEmpty title="No inherited items yet. Create global items to start inheritance" description="Content will appear here when available." /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local-only items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          {localOnlyItems.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.price} · {item.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
          {localOnlyItems.length === 0 ? <PanelEmpty title="No local-only catalog items" description="Content will appear here when available." /> : null}
        </CardContent>
      </Card>
    </Stack>
  );
}
