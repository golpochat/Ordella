'use client';

import { useEffect, useId, useState } from 'react';
import type { InventoryListItem } from '@shared-utils';
import { Button } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { adjustInventory } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';
import { Flex, FormErrorAlert, FormField, Input, Select, Textarea } from '@/components/ui/admin-form';
import { FormDialog, DialogFooterActions } from '@/components/ui/admin-dialog';

type AdjustmentModalProps = {
  presetItem?: InventoryListItem | null;
  onPresetClear?: () => void;
  onSuccess?: () => void;
};

export function AdjustmentModal({ presetItem, onPresetClear, onSuccess }: AdjustmentModalProps) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<'manual' | 'waste' | 'correction' | 'refund'>('manual');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | undefined>();
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
      setQuantityError('Enter a valid quantity');
      setError(null);
      return;
    }
    setQuantityError(undefined);
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

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Stock adjustment"
      description={
        presetItem
          ? `${presetItem.name} — current stock ${presetItem.stockLevel}`
          : 'Select a row and use Adjust, or open from the toolbar.'
      }
      size="md"
      trigger={presetItem ? undefined : <Button type="button">Stock adjustment</Button>}
      footer={
        <DialogFooterActions>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="stock-adjustment-form"
            disabled={!presetItem}
            isLoading={loading}
            loadingLabel="Saving…"
          >
            Save adjustment
          </Button>
        </DialogFooterActions>
      }
    >
      <form id="stock-adjustment-form" data-ods-save-form="" onSubmit={onSubmit}>
        <FormErrorAlert message={error} title="Adjustment failed" className="mb-4" />
        <Flex gap="sm" wrap>
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
          </Flex>
          <FormField label="Quantity" htmlFor={`${baseId}-qty`} required error={quantityError}>
            <Input
              id={`${baseId}-qty`}
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (quantityError) setQuantityError(undefined);
              }}
              onBlur={() => {
                const qty = Number.parseInt(quantity, 10);
                if (!Number.isFinite(qty) || qty < 1) {
                  setQuantityError('Enter a valid quantity');
                }
              }}
              required
              className="tabular-nums"
            />
          </FormField>
          <FormField label="Reason" htmlFor={`${baseId}-reason`}>
            <Select
              id={`${baseId}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
            >
              <option value="manual">Manual</option>
              <option value="waste">Waste</option>
              <option value="correction">Correction</option>
              <option value="refund">Refund</option>
            </Select>
          </FormField>
          <FormField label="Notes" htmlFor={`${baseId}-notes`} helper="Optional context for this adjustment.">
            <Textarea
              id={`${baseId}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
            />
          </FormField>
      </form>
    </FormDialog>
  );
}
