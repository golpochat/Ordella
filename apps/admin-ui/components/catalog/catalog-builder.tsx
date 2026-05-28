'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@shared-ui';
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
import type { CatalogCategory, CatalogItem } from '@/lib/api/catalog';
import {
  createCatalogCategory,
  deleteCatalogCategory,
  deleteCatalogItem,
  listCatalogCategories,
  listCatalogItems,
  updateCatalogCategory,
} from '@/lib/api/catalog';
import { CatalogItemEditor } from './catalog-item-editor';
import { getErrorMessage } from '@/lib/utils';

export function CatalogBuilder() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const load = useCallback(async () => {
    try {
      const [cats, its] = await Promise.all([
        listCatalogCategories(api),
        listCatalogItems(api),
      ]);
      setCategories(cats);
      setItems(its);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const editingItem = items.find((i) => i.id === editingItemId);

  async function onAddCategory() {
    if (!newCategoryName.trim()) return;
    await createCatalogCategory(api, { name: newCategoryName.trim(), isActive: true });
    setNewCategoryName('');
    await load();
  }

  async function toggleCategory(cat: CatalogCategory) {
    await updateCatalogCategory(api, { id: cat.id, isActive: !cat.isActive });
    await load();
  }

  return (
    <div className="space-y-8">
      {error ? <FormErrorAlert message={error} /> : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <input
              className="flex h-10 rounded-md border border-border-default bg-background px-3 text-sm"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button type="button" onClick={onAddCategory}>
              Add category
            </Button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="font-medium">{cat.name}</p>
                {cat.description ? (
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {cat.isActive === false ? 'Inactive' : 'Active'} · order {cat.sortOrder}
                </p>
              </div>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="outline" onClick={() => toggleCategory(cat)}>
                  {cat.isActive === false ? 'Activate' : 'Deactivate'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteCatalogCategory(api, cat.id).then(load)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Items</h2>
          <Button
            type="button"
            onClick={() => {
              setShowNewItem(true);
              setEditingItemId(null);
            }}
          >
            Add item
          </Button>
        </div>

        {showNewItem ? (
          <CatalogItemEditor
            api={api}
            categories={categories}
            onSaved={() => {
              setShowNewItem(false);
              void load();
            }}
            onCancel={() => setShowNewItem(false)}
          />
        ) : null}

        {editingItem ? (
          <CatalogItemEditor
            api={api}
            categories={categories}
            item={editingItem}
            onSaved={() => {
              setEditingItemId(null);
              void load();
            }}
            onCancel={() => setEditingItemId(null)}
          />
        ) : null}

        <AdminTableShell
          isEmpty={items.length === 0}
          emptyTitle="No catalog items yet"
          emptyDescription="Add your first item to get started."
        >
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {items.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat?.name ?? '—'}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.inventoryTrackingEnabled
                        ? (item.stockLevel ?? '—')
                        : 'Not tracked'}
                    </TableCell>
                    <TableCell>{item.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right">
                      <TableActions>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => {
                            setEditingItemId(item.id);
                            setShowNewItem(false);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => deleteCatalogItem(api, item.id).then(load)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminTableShell>
      </section>
    </div>
  );
}
