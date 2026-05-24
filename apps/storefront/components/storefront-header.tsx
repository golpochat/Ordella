'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Badge, Logo, useTheme } from '@shared-ui';
import { LocationPicker } from '@/components/location-picker';
import { getBrandName } from '@/lib/config';
import { useBasketStore } from '@/stores/basket-store';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/cart', label: 'Cart' },
];

export function StorefrontHeader() {
  const pathname = usePathname();
  const count = useBasketStore((s) => s.lineCount());
  const hydrate = useBasketStore((s) => s.hydrate);
  const theme = useTheme();
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
          ) : (
            <Logo variant="mark" size="md" color="auto" />
          )}
          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">
            {getBrandName()}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? 'rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
                  : 'rounded-md px-3 py-2 text-sm font-medium hover:bg-accent'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocationPicker />
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 ? (
              <Badge className="absolute -right-1 -top-1 min-w-5 justify-center px-1">
                {count}
              </Badge>
            ) : null}
          </Link>
        </div>
      </div>

      <nav className="flex border-t md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? 'flex-1 py-2.5 text-center text-sm font-medium text-primary'
                : 'flex-1 py-2.5 text-center text-sm text-muted-foreground'
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
