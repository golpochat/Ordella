'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { DocNavigationGroup } from '@/lib/docs';
import { DocsSidebar } from './docs-sidebar';

type DocsShellProps = {
  navigation: DocNavigationGroup[];
  children: React.ReactNode;
};

export function DocsShell({ navigation, children }: DocsShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSlug = pathname?.startsWith('/docs/') ? pathname.replace('/docs/', '') : '';

  return (
    <div className="marketing-container py-6 sm:py-8 lg:py-10">
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-navy shadow-brand"
          aria-expanded={mobileOpen}
          aria-controls="docs-mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-primary" aria-hidden />
            Browse documentation
          </span>
          {mobileOpen ? (
            <X className="h-4 w-4 text-slate" aria-hidden />
          ) : (
            <span className="text-caption font-normal">Sections</span>
          )}
        </button>
        <div
          id="docs-mobile-nav"
          className={cn(
            'mt-3 rounded-2xl border border-border bg-card p-4 shadow-brand',
            !mobileOpen && 'hidden',
          )}
        >
          <DocsSidebar
            navigation={navigation}
            activeSlug={activeSlug}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-brand">
            <DocsSidebar navigation={navigation} activeSlug={activeSlug} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
