'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { Icon, NavItem, cn } from '@shared-ui';

const links = [
  { href: '/home', label: 'Home', iconName: 'home' as const },
  { href: '/orders', label: 'Orders', iconName: 'list-ordered' as const },
  { href: '/rewards', label: 'Rewards', iconName: 'gift' as const },
  { href: '/subscriptions', label: 'Member', iconName: 'crown' as const },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/profile', label: 'Profile', iconName: 'user' as const },
];

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background" aria-label="Customer">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {links.map(({ href, label, icon: LegacyIcon, iconName }) => {
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
                  {iconName ? (
                    <Icon name={iconName} size="md" decorative />
                  ) : (
                    <LegacyIcon className="h-5 w-5" aria-hidden />
                  )}
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
