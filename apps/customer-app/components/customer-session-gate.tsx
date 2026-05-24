'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerSession } from '@/hooks/use-customer-session';

export function CustomerSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useCustomerSession();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
