'use client';

import { useCallback, useMemo, useState } from 'react';
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
import { TablePanelSkeleton } from '@/components/ui/admin-loader';
import { useAdminQuery } from '@/components/ui/admin-performance';
import { timedAdminFetcher } from '@/lib/admin-timing';

export function LowStockPanel() {
  const [adjustItem, setAdjustItem] = useState<InventoryListItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryListItem | null>(null);

  const fetchLowStock = useCallback(async () => {
    const locations = await fetchLocations();
    const options = locations.map((l) => ({ id: l.id, name: l.name, slug: l.slug }));
    const locationId = resolveActiveLocationId(options, getStoredLocationId()) ?? undefined;
    return listLowStock(createBrowserApiClient(), { locationId });
  }, []);

  const swrKey = useMemo(() => ['inventory', 'low-stock'] as const, []);

  const { data: items = [], error, isLoading, mutate } = useAdminQuery(
    swrKey,
    timedAdminFetcher('inventory.low-stock', fetchLowStock),
  );

  const load = useCallback(() => mutate(), [mutate]);
  const errorMessage = error ? getErrorMessage(error) : null;

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
      {errorMessage ? <ApiErrorBanner message={errorMessage} /> : null}
      {isLoading ? (
        <TablePanelSkeleton rows={5} columns={4} />
      ) : items.length === 0 && !errorMessage ? (
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
