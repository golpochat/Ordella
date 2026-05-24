'use client';

import { useEffect, useState } from 'react';
import { MenuView } from '@/components/menu-view';
import { fetchPublicMenu, type OnlineMenu } from '@/lib/api';

export default function MenuPage() {
  const [menu, setMenu] = useState<OnlineMenu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicMenu()
      .then(setMenu)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load menu'));
  }, []);

  if (error) {
    return <p className="p-6 text-sm text-destructive">{error}</p>;
  }

  if (!menu) {
    return <p className="p-6 text-muted-foreground">Loading menu…</p>;
  }

  return <MenuView menu={menu} />;
}
