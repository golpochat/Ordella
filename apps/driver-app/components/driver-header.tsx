'use client';

import Link from 'next/link';
import { Badge, Button, Logo } from '@shared-ui';
import { useDriverSession } from '@/hooks/use-driver-session';
import { statusLabel, type DriverStatus, setSession } from '@/lib/session';

function driverStatusVariant(status: DriverStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'available') return 'default';
  if (status === 'busy') return 'secondary';
  return 'destructive';
}

function onlineLabel(status: DriverStatus): string {
  if (status === 'available' || status === 'busy') return 'Online';
  return 'Offline';
}

export function DriverHeader() {
  const { session, refresh } = useDriverSession();
  const name = session?.driverName || 'Driver';
  const status = session?.status ?? 'offline';
  const isOnline = status === 'available' || status === 'busy';

  const toggleOnline = () => {
    if (!session) return;
    const next: DriverStatus = isOnline ? 'offline' : 'available';
    const updated = { ...session, status: next };
    setSession(updated);
    refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo variant="mark" size="sm" color="auto" />
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">Driver</p>
            <p className="truncate font-semibold leading-tight">{name}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={driverStatusVariant(status)}>{onlineLabel(status)}</Badge>
          <Button type="button" size="sm" variant="outline" onClick={toggleOnline}>
            {isOnline ? 'Go offline' : 'Go online'}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/profile?tab=settings">Settings</Link>
          </Button>
        </div>
      </div>
      <p className="px-4 pb-2 text-xs text-muted-foreground">{statusLabel(status)}</p>
    </header>
  );
}
