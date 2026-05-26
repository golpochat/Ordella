'use client';

import Link from 'next/link';
import { Logo, useTheme } from '@shared-ui';
import type { PosTheme } from '@shared-utils';
import { getSession } from '@/lib/session';
import { PosLocationSwitcher } from '@/components/pos-location-switcher';
import { PosSessionModal } from '@/components/pos-session-modal';

export function PosTopBar({
  online = true,
  syncing = false,
  pendingOrders = 0,
}: {
  online?: boolean;
  syncing?: boolean;
  pendingOrders?: number;
}) {
  const session = getSession();
  const theme = useTheme();
  const posTheme = (theme as typeof theme & { posTheme?: PosTheme }).posTheme;
  const logoUrl = posTheme?.logoUrl ?? theme.logoUrl;
  const statusLabel = syncing ? 'Syncing' : online ? 'Online' : 'Offline';
  const statusClass = 'rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium';

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between border-b bg-primary px-[var(--pos-panel-padding)] text-primary-foreground shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/home" className="inline-flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-[var(--pos-radius)] bg-background object-contain p-1" />
          ) : (
            <Logo variant="mark" size="md" color="auto" />
          )}
          <span className="text-lg font-semibold">{theme.name ?? 'Register'}</span>
        </Link>
        <div className="hidden md:block">
          <PosLocationSwitcher />
        </div>
        <span className={statusClass}>
          {statusLabel}
        </span>
        {pendingOrders > 0 ? (
          <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium">
            {pendingOrders} pending
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm opacity-80 sm:inline">
          Staff {session.cashierId ? `${session.cashierId.slice(0, 8)}…` : '—'}
        </span>
        <PosSessionModal />
      </div>
    </header>
  );
}
