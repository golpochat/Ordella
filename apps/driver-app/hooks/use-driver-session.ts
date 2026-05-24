'use client';

import { useEffect, useState } from 'react';
import { getSession, hasValidSession, type DriverSession } from '@/lib/session';

export function useDriverSession() {
  const [session, setSessionState] = useState<DriverSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = getSession();
    setSessionState(current);
    setReady(true);
  }, []);

  return {
    session,
    ready,
    isAuthenticated: session ? hasValidSession(session) : false,
    setSession: setSessionState,
  };
}
