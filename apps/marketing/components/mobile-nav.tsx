'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@shared-ui';
import { cn } from '@/lib/cn';
import { CtaButton } from './cta-button';
import { adminLoginUrl } from '@/lib/site';
import { utmCampaignFromPathname } from '@/lib/signup-url';

const nav = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const utmCampaign = utmCampaignFromPathname(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-navy/20 backdrop-blur-sm"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-menu"
            className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background px-4 py-6 shadow-elevated"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block rounded-lg px-3 py-3 text-base font-medium transition-colors',
                        active
                          ? 'bg-gray-light text-primary'
                          : 'text-navy hover:bg-gray-light',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
              <Button asChild variant="outline" className="w-full">
                <Link href={adminLoginUrl()}>Log in</Link>
              </Button>
              <CtaButton className="w-full" utmCampaign={utmCampaign} utmContent="mobile_nav">
                Start free trial
              </CtaButton>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
