'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@shared-ui';
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <input
              className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
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

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Stock</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <tr key={item.id} className="border-t border-border">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-muted-foreground">{cat?.name ?? '—'}</td>
                    <td className="p-3">{item.price}</td>
                    <td className="p-3 text-muted-foreground">{item.sku ?? '—'}</td>
                    <td className="p-3 text-muted-foreground">
                      {item.inventoryTrackingEnabled
                        ? (item.stockLevel ?? '—')
                        : 'Not tracked'}
                    </td>
                    <td className="p-3">{item.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="p-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItemId(item.id);
                          setShowNewItem(false);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="ml-1"
                        onClick={() => deleteCatalogItem(api, item.id).then(load)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No catalog items yet. Add your first item to get started.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
