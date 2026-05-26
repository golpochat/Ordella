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
  const brandName = theme.name ?? getBrandName();
  const logoUrl = theme.assets?.logo ?? theme.logoUrl;
  const centeredHeader = theme.layout?.headerLayout === 'centered';
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-20 border-b bg-primary text-primary-foreground shadow-sm">
      <div className={`mx-auto flex min-h-16 max-w-[var(--storefront-container)] items-center justify-between gap-4 px-[var(--theme-spacing)] py-2 ${centeredHeader ? 'md:justify-center' : ''}`}>
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-[var(--storefront-radius)] bg-background object-contain p-1" />
          ) : (
            <Logo variant="mark" size="md" color="auto" />
          )}
          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">
            {brandName}
          </span>
        </Link>

        <nav className={`hidden items-center gap-1 md:flex ${centeredHeader ? 'mx-4' : ''}`}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? 'rounded-[var(--storefront-radius)] bg-background px-3 py-2 text-sm font-medium text-foreground'
                  : 'rounded-[var(--storefront-radius)] px-3 py-2 text-sm font-medium hover:bg-background/20'
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
            className="relative flex items-center gap-2 rounded-[var(--storefront-radius)] px-3 py-2 hover:bg-background/20"
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

      <nav className="flex border-t border-primary-foreground/20 bg-primary md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? 'flex-1 py-2.5 text-center text-sm font-medium text-primary-foreground'
                : 'flex-1 py-2.5 text-center text-sm text-primary-foreground/70'
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
