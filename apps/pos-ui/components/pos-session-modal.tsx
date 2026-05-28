'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  FormField,
  Input,
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
} from '@/components/ui/pos-dialog';
import { getSession, hasValidSession, setSession, type PosSession } from '@/lib/session';

export function PosSessionModal() {
  const [open, setOpen] = useState(false);
  const [session, setSessionState] = useState<PosSession>({
    terminalId: '',
    cashierId: '',
    shiftId: '',
    locationId: '',
  });

  useEffect(() => {
    const current = getSession();
    setSessionState(current);
    if (!hasValidSession(current)) setOpen(true);
  }, []);

  const onSave = () => {
    setSession(session);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 border-primary-foreground/30 bg-background text-foreground hover:bg-background/90"
        >
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Register settings</DialogTitle>
          <DialogDescription>
            Set terminal, cashier, shift, and location identifiers for this register session.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Stack gap="md">
            <FormField label="Terminal ID" htmlFor="pos-terminal-id" required>
              <Input
                id="pos-terminal-id"
                value={session.terminalId}
                onChange={(e) => setSessionState((s) => ({ ...s, terminalId: e.target.value }))}
                autoComplete="off"
                required
              />
            </FormField>
            <FormField label="Cashier ID" htmlFor="pos-cashier-id" required>
              <Input
                id="pos-cashier-id"
                value={session.cashierId}
                onChange={(e) => setSessionState((s) => ({ ...s, cashierId: e.target.value }))}
                autoComplete="off"
                required
              />
            </FormField>
            <FormField label="Shift ID" htmlFor="pos-shift-id" required>
              <Input
                id="pos-shift-id"
                value={session.shiftId}
                onChange={(e) => setSessionState((s) => ({ ...s, shiftId: e.target.value }))}
                autoComplete="off"
                required
              />
            </FormField>
            <FormField label="Location ID" htmlFor="pos-location-id" required>
              <Input
                id="pos-location-id"
                value={session.locationId}
                onChange={(e) => setSessionState((s) => ({ ...s, locationId: e.target.value }))}
                autoComplete="off"
                required
              />
            </FormField>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogFooterActions>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={!hasValidSession(session)}>
              Save session
            </Button>
          </DialogFooterActions>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
