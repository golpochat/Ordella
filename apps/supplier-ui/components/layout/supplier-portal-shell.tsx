'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@shared-ui';
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
          <nav className="flex w-full flex-wrap items-center gap-2 overflow-x-auto sm:w-auto">
            {SUPPLIER_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button type="button" className="shrink-0 rounded-full border bg-background px-3 py-2 text-sm hover:bg-muted" onClick={onSignOut}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
