'use client';

import { useEffect, useState } from 'react';
import { getCustomerName, hasCustomerSession } from '@/lib/session';

export function useCustomerSession() {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState('Guest');

  useEffect(() => {
    setIsAuthenticated(hasCustomerSession());
    setName(getCustomerName());
    setReady(true);
  }, []);

  return { ready, isAuthenticated, name, setName };
}
