'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@shared-ui';
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
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-light text-primary'
                    : 'text-slate hover:bg-gray-light hover:text-navy',
                )}
              >
                {item.label}
              </Link>
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
