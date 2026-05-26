'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shared-ui';
import {
  ADMIN_SESSION_CHANGED_EVENT,
  clearBrowserAuthSession,
  getAdminUserLabel,
} from '@/lib/api/browser';

export function UserMenu() {
  const router = useRouter();
  const [label, setLabel] = useState('Admin');

  useEffect(() => {
    const syncLabel = () => setLabel(getAdminUserLabel());
    syncLabel();
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, syncLabel);
    return () => window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, syncLabel);
  }, []);

  async function logout() {
    await clearBrowserAuthSession();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">{label}</span>
      <Button variant="outline" size="sm" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
