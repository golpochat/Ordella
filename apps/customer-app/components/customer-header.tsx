'use client';

import Link from 'next/link';
import { Logo } from '@shared-ui';
import { getBrandName } from '@/lib/config';
import { useCustomerSession } from '@/hooks/use-customer-session';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function CustomerHeader() {
  const { name } = useCustomerSession();

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/home" className="flex items-center gap-2">
          <Logo variant="mark" size="sm" color="auto" />
          <span className="text-lg font-bold tracking-tight">{getBrandName()}</span>
        </Link>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label="Profile"
        >
          <span className="text-xs font-semibold">{initials(name)}</span>
        </Link>
      </div>
    </header>
  );
}
