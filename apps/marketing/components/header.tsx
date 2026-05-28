'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, NavItem } from '@shared-ui';
import { cn } from '@/lib/cn';
import { CtaButton } from './cta-button';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { adminLoginUrl } from '@/lib/site';
import { utmCampaignFromPathname } from '@/lib/signup-url';

const nav = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const pathname = usePathname();
  const utmCampaign = utmCampaignFromPathname(pathname ?? '/');

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="marketing-container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="marketing-header-nav items-center gap-1" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <NavItem
                key={item.href}
                asChild
                variant="subnav"
                active={active}
                className={cn('rounded-lg text-slate', active ? 'bg-gray-light text-primary' : 'hover:bg-gray-light hover:text-navy')}
              >
                <Link href={item.href} aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              </NavItem>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-slate sm:inline-flex">
            <Link href={adminLoginUrl()}>Log in</Link>
          </Button>
          <CtaButton
            size="sm"
            className="hidden xs:inline-flex"
            utmCampaign={utmCampaign}
            utmContent="header"
          >
            Start free trial
          </CtaButton>
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
