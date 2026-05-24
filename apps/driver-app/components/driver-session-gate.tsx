'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDriverSession } from '@/hooks/use-driver-session';

export function DriverSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useDriverSession();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground">
        Loading driver session…
      </div>
    );
  }

  return <>{children}</>;
}
