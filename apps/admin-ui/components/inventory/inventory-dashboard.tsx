'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { InventoryListItem } from '@shared-utils';
import { getStoredLocationId, resolveActiveLocationId } from '@shared-utils';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { createBrowserApiClient } from '@/lib/api/browser';
import { fetchLocations } from '@/lib/api/locations';
import { listInventory } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';
import { StockTable } from './stock-table';
import { AdjustmentModal } from './adjustment-modal';
import { InventoryEditorModal } from './inventory-editor-modal';

export function InventoryDashboard() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? undefined;
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
      const rows = await listInventory(createBrowserApiClient(), { locationId, search });
      setItems(rows);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

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
        <p className="text-sm text-muted-foreground">Loading stock…</p>
      ) : items.length === 0 && !error ? (
        <EmptyState
          title="No stock records"
          description="Enable inventory tracking on catalog items, then stock rows appear per location."
        />
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
