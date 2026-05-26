'use client';

import { useEffect, useState } from 'react';
import { CUSTOMER_SESSION_CHANGED_EVENT, getCustomerName, hasCustomerSession } from '@/lib/session';

export function useCustomerSession() {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState('Guest');

  useEffect(() => {
    const syncSession = () => {
      setIsAuthenticated(hasCustomerSession());
      setName(getCustomerName());
      setReady(true);
    };

    syncSession();
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  return { ready, isAuthenticated, name, setName };
}
