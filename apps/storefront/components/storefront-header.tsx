'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Button, Icon, NavItem, Logo, useTheme } from '@shared-ui';
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
  const [mounted, setMounted] = useState(false);
  const brandName = theme.name ?? getBrandName();
  const logoUrl = theme.assets?.logo ?? theme.logoUrl;
  const centeredHeader = theme.layout?.headerLayout === 'centered';
  useEffect(() => {
    hydrate();
    setMounted(true);
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

        <nav className={`hidden items-center gap-1 md:flex ${centeredHeader ? 'mx-4' : ''}`} aria-label="Storefront">
          {nav.map((item) => {
            const active = mounted && pathname === item.href;
            return (
              <NavItem
                key={item.href}
                asChild
                variant="subnav"
                active={active}
                className="text-primary-foreground"
              >
                <Link href={item.href} aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              </NavItem>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocationPicker className="text-primary-foreground [&_select]:text-foreground [&_span]:text-primary-foreground/90" />
          <Button
            asChild
            variant="ghost"
            className="relative h-auto px-3 py-2 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground"
            aria-label={`Cart, ${count} items`}
          >
            <Link href="/cart">
              <Icon name="shopping-cart" size="lg" decorative />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 ? (
                <Badge className="absolute -right-1 -top-1 min-w-5 justify-center px-1">
                  {count}
                </Badge>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>

      <nav className="flex border-t border-primary-foreground/20 bg-primary md:hidden" aria-label="Storefront mobile">
        {nav.map((item) => {
          const active = mounted && pathname === item.href;
          return (
            <NavItem
              key={item.href}
              asChild
              variant="subnav"
              active={active}
              className="flex-1 justify-center rounded-none py-2.5 text-primary-foreground"
            >
              <Link href={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            </NavItem>
          );
        })}
      </nav>
    </header>
  );
}
