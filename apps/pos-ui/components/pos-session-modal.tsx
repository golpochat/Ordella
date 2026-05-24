'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@shared-ui';
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
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button variant="outline" className="h-11">Settings</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Register settings</ModalTitle>
        </ModalHeader>
        <div className="grid gap-3 py-3">
          <Input
            placeholder="Terminal ID"
            value={session.terminalId}
            onChange={(e) => setSessionState((s) => ({ ...s, terminalId: e.target.value }))}
          />
          <Input
            placeholder="Cashier ID"
            value={session.cashierId}
            onChange={(e) => setSessionState((s) => ({ ...s, cashierId: e.target.value }))}
          />
          <Input
            placeholder="Shift ID"
            value={session.shiftId}
            onChange={(e) => setSessionState((s) => ({ ...s, shiftId: e.target.value }))}
          />
          <Input
            placeholder="Location ID"
            value={session.locationId}
            onChange={(e) => setSessionState((s) => ({ ...s, locationId: e.target.value }))}
          />
        </div>
        <ModalFooter>
          <Button onClick={onSave} disabled={!hasValidSession(session)}>
            Save session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
