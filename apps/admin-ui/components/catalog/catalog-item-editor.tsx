'use client';

import { useState } from 'react';
import { Button, Input } from '@shared-ui';
import type { CatalogCategory, CatalogItem } from '@/lib/api/catalog';
import {
  addCatalogModifier,
  addCatalogVariant,
  createCatalogItem,
  updateCatalogItem,
  uploadCatalogItemImage,
} from '@/lib/api/catalog';
import type { ApiClient } from '@shared-utils';
import { getErrorMessage } from '@/lib/utils';

type CatalogItemEditorProps = {
  api: ApiClient;
  categories: CatalogCategory[];
  item?: CatalogItem;
  onSaved: () => void;
  onCancel: () => void;
};

export function CatalogItemEditor({
  api,
  categories,
  item,
  onSaved,
  onCancel,
}: CatalogItemEditorProps) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item?.price ?? '');
  const [sku, setSku] = useState(item?.sku ?? '');
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [inventoryTracking, setInventoryTracking] = useState(
    item?.inventoryTrackingEnabled ?? false,
  );
  const [stockLevel, setStockLevel] = useState(
    item?.stockLevel !== null && item?.stockLevel !== undefined ? String(item.stockLevel) : '',
  );
  const [variantName, setVariantName] = useState('');
  const [variantDelta, setVariantDelta] = useState('0.00');
  const [modifierName, setModifierName] = useState('');
  const [modifierOptionName, setModifierOptionName] = useState('');
  const [modifierOptionPrice, setModifierOptionPrice] = useState('0.00');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveItem() {
    setLoading(true);
    setError(null);
    const body = {
      ...(item ? { id: item.id } : {}),
      name: name.trim(),
      description: description.trim() || undefined,
      price,
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      categoryId: categoryId || undefined,
      imageUrl: imageUrl.trim() || undefined,
      status: isActive ? 'active' : 'inactive',
      inventoryTrackingEnabled: inventoryTracking,
      stockLevel: stockLevel ? Number(stockLevel) : undefined,
      channelVisibility: { pos: true, online: true },
    };

    try {
      if (item) {
        await updateCatalogItem(api, body);
      } else {
        await createCatalogItem(api, body);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onUploadImage() {
    if (!item || !imageUrl.trim()) return;
    setLoading(true);
    try {
      await uploadCatalogItemImage(api, item.id, imageUrl.trim());
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onAddVariant() {
    if (!item || !variantName.trim()) return;
    setLoading(true);
    try {
      await addCatalogVariant(api, {
        itemId: item.id,
        name: variantName.trim(),
        priceDelta: variantDelta,
      });
      setVariantName('');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onAddModifier() {
    if (!item || !modifierName.trim()) return;
    setLoading(true);
    try {
      await addCatalogModifier(api, {
        itemId: item.id,
        name: modifierName.trim(),
        options: modifierOptionName.trim()
          ? [{ name: modifierOptionName.trim(), priceDelta: modifierOptionPrice }]
          : [],
      });
      setModifierName('');
      setModifierOptionName('');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold">{item ? 'Edit item' : 'Add item'}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="itemName">
            Name
          </label>
          <Input id="itemName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="itemDesc">
            Description
          </label>
          <Input id="itemDesc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="itemPrice">
            Price
          </label>
          <Input id="itemPrice" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="itemCategory">
            Category
          </label>
          <select
            id="itemCategory"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="itemSku">
            SKU
          </label>
          <Input id="itemSku" value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="itemBarcode">
            Barcode
          </label>
          <Input id="itemBarcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="itemImage">
            Image URL
          </label>
          <div className="flex gap-2">
            <Input id="itemImage" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            {item ? (
              <Button type="button" variant="outline" disabled={loading} onClick={onUploadImage}>
                Save image
              </Button>
            ) : null}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inventoryTracking}
            onChange={(e) => setInventoryTracking(e.target.checked)}
          />
          Inventory tracking
        </label>
        {inventoryTracking ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="stockLevel">
              Stock level
            </label>
            <Input
              id="stockLevel"
              type="number"
              min={0}
              value={stockLevel}
              onChange={(e) => setStockLevel(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      {item ? (
        <>
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Variants</p>
            {item.variants.length > 0 ? (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {item.variants.map((v) => (
                  <li key={v.id}>
                    {v.name} ({v.priceDelta})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No variants yet.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Variant name"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
              />
              <Input
                placeholder="Price delta"
                value={variantDelta}
                onChange={(e) => setVariantDelta(e.target.value)}
              />
              <Button type="button" variant="outline" disabled={loading} onClick={onAddVariant}>
                Add variant
              </Button>
            </div>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Modifiers</p>
            {item.modifiers.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {item.modifiers.map((m) => (
                  <li key={m.id} className="rounded-md border border-border p-2">
                    <span className="font-medium">{m.name}</span>
                    {m.required ? ' (required)' : ''}
                    <ul className="mt-1 text-muted-foreground">
                      {m.options.map((o) => (
                        <li key={o.id}>
                          {o.name} +{o.priceDelta}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No modifier groups yet.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Modifier group"
                value={modifierName}
                onChange={(e) => setModifierName(e.target.value)}
              />
              <Input
                placeholder="Option name"
                value={modifierOptionName}
                onChange={(e) => setModifierOptionName(e.target.value)}
              />
              <Input
                placeholder="Option price"
                value={modifierOptionPrice}
                onChange={(e) => setModifierOptionPrice(e.target.value)}
              />
              <Button type="button" variant="outline" disabled={loading} onClick={onAddModifier}>
                Add modifier
              </Button>
            </div>
          </div>
        </>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" disabled={loading} onClick={saveItem}>
          {loading ? 'Saving…' : item ? 'Save item' : 'Create item'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
