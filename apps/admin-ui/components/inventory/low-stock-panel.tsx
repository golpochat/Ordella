'use client';

import { useCallback, useEffect, useState } from 'react';
import type { InventoryListItem } from '@shared-utils';
import { getStoredLocationId, resolveActiveLocationId } from '@shared-utils';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations } from '@/lib/api/locations';
import { listLowStock } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';
import { StockTable } from './stock-table';
import { AdjustmentModal } from './adjustment-modal';
import { InventoryEditorModal } from './inventory-editor-modal';

export function LowStockPanel() {
  const [items, setItems] = useState<InventoryListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustItem, setAdjustItem] = useState<InventoryListItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryListItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const locations = await fetchLocations();
      const options = locations.map((l) => ({ id: l.id, name: l.name, slug: l.slug }));
      const locationId = resolveActiveLocationId(options, getStoredLocationId()) ?? undefined;
      const rows = await listLowStock(createBrowserApiClient(), { locationId });
      setItems(rows);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdjustmentModal
        presetItem={adjustItem}
        onPresetClear={() => setAdjustItem(null)}
        onSuccess={() => void load()}
      />
      <InventoryEditorModal
        item={editItem}
        open={!!editItem}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading low stock…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState title="All stocked" description="No low or out-of-stock items for this location." />
      ) : (
        <StockTable
          items={items}
          onAdjust={(item) => setAdjustItem(item)}
          onEdit={(item) => setEditItem(item)}
        />
      )}
    </>
  );
}
