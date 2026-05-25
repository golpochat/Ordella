'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InventoryListItem } from '@shared-utils';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { updateInventoryItem } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';

type InventoryEditorModalProps = {
  item: InventoryListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryEditorModal({ item, open, onOpenChange }: InventoryEditorModalProps) {
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
        ...(reorderPoint.trim()
          ? { reorderPoint: Number.parseInt(reorderPoint, 10) }
          : {}),
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
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>
            <ModalTitle>Edit stock</ModalTitle>
            <ModalDescription>{item?.name ?? 'Inventory item'}</ModalDescription>
          </ModalHeader>
          <div className="space-y-3 py-4">
            <div>
              <label htmlFor="stockLevel" className="mb-1 block text-sm font-medium">
                Stock level
              </label>
              <Input
                id="stockLevel"
                type="number"
                min={0}
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="reorderPoint" className="mb-1 block text-sm font-medium">
                Reorder point
              </label>
              <Input
                id="reorderPoint"
                type="number"
                min={0}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active (visible for sale when in stock)
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !item}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
