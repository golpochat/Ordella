'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Select,
  Stack,
} from '@shared-ui';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooterActions,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared-ui';
import { saveFdsSettings, type FdsLocalSettings } from '@/lib/fds-settings';
import {
  getStoredKdsAccessToken,
  getStoredKdsCredentials,
  setKdsAccessToken,
  setKdsCredentials,
} from '@/lib/config';

type FdsSettingsModalProps = {
  settings: FdsLocalSettings;
  onChange: (settings: FdsLocalSettings) => void;
};

export function FdsSettingsModal({ settings, onChange }: FdsSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(settings);
  const [accessToken, setAccessToken] = useState('');
  const [kdsEmail, setKdsEmail] = useState('');
  const [kdsPassword, setKdsPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setDraft(settings);
      return;
    }
    setAccessToken(getStoredKdsAccessToken());
    const credentials = getStoredKdsCredentials();
    setKdsEmail(credentials.email);
    setKdsPassword(credentials.password);
  }, [open, settings]);

  const onSave = () => {
    saveFdsSettings(draft);
    setKdsAccessToken(accessToken || null);
    if (kdsEmail || kdsPassword) setKdsCredentials(kdsEmail, kdsPassword);
    onChange(draft);
    setOpen(false);
    if (draft.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-10 text-foreground">
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Fulfillment display settings</DialogTitle>
          <DialogDescription>Configure alerts, display options, and KDS authentication.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Stack gap="md">
            <Checkbox
              label="Sound alerts for new orders"
              checked={draft.soundAlerts}
              onChange={(e) => setDraft((s) => ({ ...s, soundAlerts: e.target.checked }))}
            />
            <Checkbox
              label="Dark mode"
              checked={draft.darkMode}
              onChange={(e) => setDraft((s) => ({ ...s, darkMode: e.target.checked }))}
            />
            <Checkbox
              label="Show completed column"
              checked={draft.showCompleted}
              onChange={(e) => setDraft((s) => ({ ...s, showCompleted: e.target.checked }))}
            />
            <Checkbox
              label="Show customer info on cards"
              checked={draft.showCustomerInfo}
              onChange={(e) => setDraft((s) => ({ ...s, showCustomerInfo: e.target.checked }))}
            />
            <FormField label="Fulfillment mode filter" htmlFor="fds-fulfillment-filter">
              <Select
                id="fds-fulfillment-filter"
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
              </Select>
            </FormField>
            <FormField
              label="KDS access token"
              htmlFor="fds-access-token"
              helper="Required for protected fulfillment feed and status updates."
            >
              <Input
                id="fds-access-token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste a fresh staff/admin JWT"
                type="password"
                autoComplete="off"
              />
            </FormField>
            <FormField label="Staff email" htmlFor="fds-staff-email">
              <Input
                id="fds-staff-email"
                value={kdsEmail}
                onChange={(e) => setKdsEmail(e.target.value)}
                placeholder="staff@example.com"
                type="email"
                autoComplete="username"
              />
            </FormField>
            <FormField label="Staff password" htmlFor="fds-staff-password">
              <Input
                id="fds-staff-password"
                value={kdsPassword}
                onChange={(e) => setKdsPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
              />
            </FormField>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogFooterActions>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave}>
              Save
            </Button>
          </DialogFooterActions>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
