'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@shared-ui';
import { CtaButton } from './cta-button';
import { adminLoginUrl, siteConfig } from '@/lib/site';

const nav = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={adminLoginUrl()}>Log in</Link>
          </Button>
          <CtaButton size="sm" utmContent="header">
            Start free trial
          </CtaButton>
        </div>
      </div>
    </header>
  );
}
