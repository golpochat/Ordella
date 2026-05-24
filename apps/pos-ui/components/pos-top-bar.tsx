'use client';

import Link from 'next/link';
import { Logo } from '@shared-ui';
import { getSession } from '@/lib/session';
import { PosLocationSwitcher } from '@/components/pos-location-switcher';
import { PosSessionModal } from '@/components/pos-session-modal';

export function PosTopBar({ online = true }: { online?: boolean }) {
  const session = getSession();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Link href="/home" className="inline-flex items-center gap-2">
          <Logo variant="mark" size="md" color="auto" />
          <span className="text-lg font-semibold">Register</span>
        </Link>
        <div className="hidden md:block">
          <PosLocationSwitcher />
        </div>
        <span
          className={
            online
              ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
              : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'
          }
        >
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Staff {session.cashierId ? `${session.cashierId.slice(0, 8)}…` : '—'}
        </span>
        <PosSessionModal />
      </div>
    </header>
  );
}
