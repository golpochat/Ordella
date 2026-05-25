'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@shared-ui';
import { SUPPLIER_NAV } from '@/lib/navigation';

export function SupplierPortalShell({ children, onSignOut }: { children: React.ReactNode; onSignOut: () => void }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="inline-flex">
            <Logo variant="full" size="sm" color="auto" />
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {SUPPLIER_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={onSignOut}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
