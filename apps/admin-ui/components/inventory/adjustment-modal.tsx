'use client';

import { useEffect, useState } from 'react';
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
  ModalTrigger,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { adjustInventory } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';

type AdjustmentModalProps = {
  presetItem?: InventoryListItem | null;
  onPresetClear?: () => void;
  onSuccess?: () => void;
};

export function AdjustmentModal({ presetItem, onPresetClear, onSuccess }: AdjustmentModalProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<'manual' | 'waste' | 'correction' | 'refund'>('manual');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presetItem) {
      setOpen(true);
      setQuantity('1');
      setNotes('');
      setError(null);
    }
  }, [presetItem]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      onPresetClear?.();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!presetItem) return;
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      setError('Enter a valid quantity');
      return;
    }
    const change = direction === 'increase' ? qty : -qty;
    setLoading(true);
    setError(null);
    try {
      await adjustInventory(createBrowserApiClient(), {
        stockItemId: presetItem.id,
        locationId: presetItem.locationId,
        change,
        reason,
        notes: notes || undefined,
      });
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const trigger = presetItem ? null : (
    <ModalTrigger asChild>
      <Button>Stock adjustment</Button>
    </ModalTrigger>
  );

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      {trigger}
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>
            <ModalTitle>Stock adjustment</ModalTitle>
            <ModalDescription>
              {presetItem
                ? `${presetItem.name} — current stock ${presetItem.stockLevel}`
                : 'Select a row and use Adjust, or open from the toolbar.'}
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-3 py-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={direction === 'increase' ? 'default' : 'outline'}
                onClick={() => setDirection('increase')}
              >
                Increase
              </Button>
              <Button
                type="button"
                variant={direction === 'decrease' ? 'default' : 'outline'}
                onClick={() => setDirection('decrease')}
              >
                Decrease
              </Button>
            </div>
            <div>
              <label htmlFor="qty" className="mb-1 block text-sm font-medium">
                Quantity
              </label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium">
                Reason
              </label>
              <select
                id="reason"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value as typeof reason)}
              >
                <option value="manual">Manual</option>
                <option value="waste">Waste</option>
                <option value="correction">Correction</option>
                <option value="refund">Refund</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                Notes (optional)
              </label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !presetItem}>
              Save adjustment
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
