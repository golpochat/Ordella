'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, CardBody, Icon } from '@shared-ui';
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
        <Button
          type="button"
          variant="outline"
          className="flex h-auto w-full items-center justify-between gap-3 rounded-xl border-border bg-card px-4 py-3 text-sm font-semibold text-navy shadow-sm"
          aria-expanded={mobileOpen}
          aria-controls="docs-mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="flex items-center gap-2">
            <Icon name="menu" size="sm" className="text-primary" decorative />
            Browse documentation
          </span>
          {mobileOpen ? (
            <Icon name="close" size="sm" className="text-slate" decorative />
          ) : (
            <span className="text-caption font-normal">Sections</span>
          )}
        </Button>
        <Card
          id="docs-mobile-nav"
          className={cn(
            'mt-3 shadow-sm',
            !mobileOpen && 'hidden',
          )}
          data-ods-elevation="sm"
        >
          <CardBody className="p-4">
          <DocsSidebar
            navigation={navigation}
            activeSlug={activeSlug}
            onNavigate={() => setMobileOpen(false)}
          />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-16">
        <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
          <Card className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto shadow-sm" data-ods-elevation="sm">
            <CardBody className="p-5">
            <DocsSidebar navigation={navigation} activeSlug={activeSlug} />
            </CardBody>
          </Card>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
