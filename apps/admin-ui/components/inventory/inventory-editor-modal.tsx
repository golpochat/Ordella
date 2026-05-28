'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InventoryListItem } from '@shared-utils';
import { Button } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateInventoryItem } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';
import {
  Checkbox,
  FormErrorAlert,
  FormField,
  Input,
} from '@/components/ui/admin-form';
import { FormDialog, DialogFooterActions } from '@/components/ui/admin-dialog';

type InventoryEditorModalProps = {
  item: InventoryListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryEditorModal({ item, open, onOpenChange }: InventoryEditorModalProps) {
  const baseId = useId();
  const router = useRouter();
  const [stockLevel, setStockLevel] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    setStockLevel(String(item.stockLevel));
    setReorderPoint(item.reorderPoint !== null ? String(item.reorderPoint) : '');
    setIsActive(item.isActive);
    setError(null);
  }, [item]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      await updateInventoryItem(createBrowserApiClient(), {
        id: item.id,
        stockLevel: Number.parseInt(stockLevel, 10),
        ...(reorderPoint.trim() ? { reorderPoint: Number.parseInt(reorderPoint, 10) } : {}),
        isActive,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit stock"
      description={item?.name ?? 'Inventory item'}
      size="md"
      footer={
        <DialogFooterActions>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="inventory-editor-form" disabled={!item} isLoading={loading} loadingLabel="Saving…">
            Save
          </Button>
        </DialogFooterActions>
      }
    >
      <form id="inventory-editor-form" onSubmit={onSubmit}>
        <FormErrorAlert message={error} title="Unable to save" className="mb-4" />
        <FormField label="Stock level" htmlFor={`${baseId}-stock`} required>
            <Input
              id={`${baseId}-stock`}
              type="number"
              min={0}
              required
              value={stockLevel}
              onChange={(e) => setStockLevel(e.target.value)}
              className="tabular-nums"
            />
          </FormField>
          <FormField label="Reorder point" htmlFor={`${baseId}-reorder`} helper="Optional low-stock threshold.">
            <Input
              id={`${baseId}-reorder`}
              type="number"
              min={0}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              className="tabular-nums"
            />
          </FormField>
          <Checkbox
            id={`${baseId}-active`}
            label="Active"
            description="Inactive items are hidden from POS and storefront."
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
      </form>
    </FormDialog>
  );
}
