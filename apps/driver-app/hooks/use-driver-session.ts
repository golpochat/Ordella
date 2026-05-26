'use client';

import { useEffect, useState } from 'react';
import {
  DRIVER_SESSION_CHANGED_EVENT,
  getSession,
  hasValidSession,
  type DriverSession,
} from '@/lib/session';

export function useDriverSession() {
  const [session, setSessionState] = useState<DriverSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      const current = getSession();
      setSessionState(current);
      setReady(true);
    };

    syncSession();
    window.addEventListener(DRIVER_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(DRIVER_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  const refresh = () => {
    setSessionState(getSession());
  };

  return {
    session,
    ready,
    isAuthenticated: session ? hasValidSession(session) : false,
    setSession: setSessionState,
    refresh,
  };
}
