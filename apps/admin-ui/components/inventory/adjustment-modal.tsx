'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createAdjustment } from '@/lib/api/admin/inventory';
import { getErrorMessage } from '@/lib/utils';

export function AdjustmentModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stockItemId, setStockItemId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [kind, setKind] = useState<'manual' | 'correction' | 'wastage'>('manual');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createAdjustment(createBrowserApiClient(), {
        stockItemId,
        locationId,
        kind,
        delta: Number(delta),
        reason: reason || undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button>Stock adjustment</Button>
      </ModalTrigger>
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>
            <ModalTitle>Stock adjustment</ModalTitle>
            <ModalDescription>
              Record wastage, correction, or manual inventory change.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-3 py-4">
            <Input
              placeholder="Stock item ID"
              value={stockItemId}
              onChange={(e) => setStockItemId(e.target.value)}
              required
            />
            <Input
              placeholder="Location ID"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              <option value="manual">Manual</option>
              <option value="correction">Correction</option>
              <option value="wastage">Wastage</option>
            </select>
            <Input
              type="number"
              step="any"
              placeholder="Delta (+/-)"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              required
            />
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save adjustment
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
