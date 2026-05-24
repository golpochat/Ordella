'use client';

import { useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@shared-ui';
import { saveFdsSettings, type FdsLocalSettings } from '@/lib/fds-settings';

type FdsSettingsModalProps = {
  settings: FdsLocalSettings;
  onChange: (settings: FdsLocalSettings) => void;
};

export function FdsSettingsModal({ settings, onChange }: FdsSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(settings);

  const onSave = () => {
    saveFdsSettings(draft);
    onChange(draft);
    setOpen(false);
    if (draft.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button type="button" variant="outline" className="h-10">
          Settings
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Fulfillment display settings</ModalTitle>
        </ModalHeader>
        <div className="space-y-3 py-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.soundAlerts}
              onChange={(e) => setDraft((s) => ({ ...s, soundAlerts: e.target.checked }))}
            />
            Sound alerts for new orders
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.darkMode}
              onChange={(e) => setDraft((s) => ({ ...s, darkMode: e.target.checked }))}
            />
            Dark mode
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.showCompleted}
              onChange={(e) => setDraft((s) => ({ ...s, showCompleted: e.target.checked }))}
            />
            Show completed column
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.showCustomerInfo}
              onChange={(e) => setDraft((s) => ({ ...s, showCustomerInfo: e.target.checked }))}
            />
            Show customer info on cards
          </label>
          <div>
            <p className="mb-1 font-medium">Fulfillment mode filter</p>
            <select
              className="h-10 w-full rounded-md border bg-background px-2"
              value={draft.fulfillmentModeFilter}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  fulfillmentModeFilter: e.target.value as FdsLocalSettings['fulfillmentModeFilter'],
                }))
              }
            >
              <option value="all">All</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
              <option value="in_store">In-store</option>
            </select>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
