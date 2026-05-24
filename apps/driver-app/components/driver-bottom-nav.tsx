'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks, User, Settings } from 'lucide-react';
import { cn } from '@shared-ui';

const links = [
  { href: '/orders', label: 'Orders', icon: ListChecks },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/profile?tab=settings', label: 'Settings', icon: Settings },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
