'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@shared-ui';
import { getBrandName } from '@/lib/config';
import { useBasketStore } from '@/stores/basket-store';

export function StorefrontHeader() {
  const count = useBasketStore((s) => s.lineCount());

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/menu" className="text-xl font-bold tracking-tight">
          {getBrandName()}
        </Link>
        <Link href="/basket" className="relative flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
          <ShoppingCart className="h-6 w-6" />
          <span className="hidden sm:inline">Basket</span>
          {count > 0 ? (
            <Badge className="absolute -right-1 -top-1 min-w-5 justify-center px-1">{count}</Badge>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
