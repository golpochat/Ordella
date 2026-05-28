'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, NavItem, Logo } from '@shared-ui';
import { SUPPLIER_NAV } from '@/lib/navigation';

export function SupplierPortalShell({ children, onSignOut }: { children: React.ReactNode; onSignOut: () => void }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex">
              <Logo variant="full" size="sm" color="auto" />
            </Link>
            <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              Supplier workspace
            </span>
          </div>
          <nav className="flex w-full flex-wrap items-center gap-2 overflow-x-auto sm:w-auto" aria-label="Supplier">
            {SUPPLIER_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <NavItem
                  key={item.id}
                  asChild
                  variant="subnav"
                  active={active}
                  className="shrink-0 rounded-full"
                >
                  <Link href={item.href} aria-current={active ? 'page' : undefined}>
                    <span className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                </NavItem>
              );
            })}
            <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full" onClick={onSignOut}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
