'use client';

import { Badge } from '@shared-ui';
import { useDriverSession } from '@/hooks/use-driver-session';
import { statusLabel, type DriverStatus } from '@/lib/session';

function driverStatusVariant(status: DriverStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'available') return 'default';
  if (status === 'busy') return 'secondary';
  return 'destructive';
}

export function DriverHeader() {
  const { session } = useDriverSession();
  const name = session?.driverName || 'Driver';
  const status = session?.status ?? 'offline';

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div>
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="font-semibold leading-tight">{name}</p>
        </div>
        <Badge variant={driverStatusVariant(status)}>{statusLabel(status)}</Badge>
      </div>
    </header>
  );
}
