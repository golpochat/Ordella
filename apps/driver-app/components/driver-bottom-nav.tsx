'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, NavItem, cn } from '@shared-ui';

const links = [
  { href: '/orders', label: 'Orders', iconName: 'list-checks' as const },
  { href: '/profile', label: 'Profile', iconName: 'user' as const },
  { href: '/profile?tab=settings', label: 'Settings', iconName: 'settings' as const },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background" aria-label="Driver">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {links.map(({ href, label, iconName }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <NavItem
              key={href}
              asChild
              variant="subnav"
              active={active}
              className={cn('flex-1 rounded-none px-0 py-0', active ? 'text-primary' : 'text-muted-foreground')}
            >
              <Link href={href} aria-current={active ? 'page' : undefined}>
                <span className="flex flex-col items-center justify-center gap-1 text-xs">
                  <Icon name={iconName} size="md" decorative />
                  <span>{label}</span>
                </span>
              </Link>
            </NavItem>
          );
        })}
      </div>
    </nav>
  );
}
