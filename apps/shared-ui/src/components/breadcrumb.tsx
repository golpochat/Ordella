'use client';

import * as React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';

export type BreadcrumbItemData = {
  label: string;
  href?: string;
  icon?: LucideIcon;
};

type BreadcrumbSegment =
  | { type: 'link'; label: string; href: string; icon?: LucideIcon }
  | { type: 'page'; label: string; icon?: LucideIcon }
  | { type: 'ellipsis' };

function useBreadcrumbDensity(): 'full' | 'compact' | 'minimal' {
  const [density, setDensity] = React.useState<'full' | 'compact' | 'minimal'>('full');

  React.useEffect(() => {
    const tabletMq = window.matchMedia('(max-width: 768px)');
    const mobileMq = window.matchMedia('(max-width: 480px)');

    const update = () => {
      if (mobileMq.matches) setDensity('minimal');
      else if (tabletMq.matches) setDensity('compact');
      else setDensity('full');
    };

    update();
    tabletMq.addEventListener('change', update);
    mobileMq.addEventListener('change', update);
    return () => {
      tabletMq.removeEventListener('change', update);
      mobileMq.removeEventListener('change', update);
    };
  }, []);

  return density;
}

export function getBreadcrumbSegments(
  items: BreadcrumbItemData[],
  density: 'full' | 'compact' | 'minimal',
): BreadcrumbSegment[] {
  if (items.length === 0) return [];

  const segments: BreadcrumbSegment[] = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast || !item.href) {
      return { type: 'page', label: item.label, icon: item.icon };
    }
    return { type: 'link', label: item.label, href: item.href, icon: item.icon };
  });

  if (density === 'full' || items.length <= 2) return segments;

  if (density === 'minimal') {
    if (items.length === 1) return segments;
    const parent = segments[segments.length - 2];
    const current = segments[segments.length - 1];
    if (parent.type === 'link') return [parent, current];
    return [{ type: 'ellipsis' }, current];
  }

  if (items.length <= 3) return segments;
  return [segments[0], { type: 'ellipsis' }, segments[segments.length - 1]];
}

export interface BreadcrumbIconProps {
  icon: LucideIcon;
  className?: string;
}

export function BreadcrumbIcon({ icon: Icon, className }: BreadcrumbIconProps) {
  return <Icon className={cn('h-4 w-4 shrink-0', className)} aria-hidden />;
}

export interface BreadcrumbSeparatorProps {
  className?: string;
}

export function BreadcrumbSeparator({ className }: BreadcrumbSeparatorProps) {
  return <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground', className)} aria-hidden />;
}

export interface BreadcrumbItemProps {
  href?: string;
  children: React.ReactNode;
  isCurrent?: boolean;
  className?: string;
  icon?: LucideIcon;
}

export function BreadcrumbItem({ href, children, isCurrent, className, icon: Icon }: BreadcrumbItemProps) {
  const content = (
    <Flex gap="xs" align="center" className="min-w-0">
      {Icon ? <BreadcrumbIcon icon={Icon} /> : null}
      <span className="truncate">{children}</span>
    </Flex>
  );

  if (isCurrent || !href) {
    return (
      <li
        className={cn('min-w-0 max-w-[min(100%,16rem)]', className)}
        aria-current="page"
      >
        <span className="inline-flex min-h-9 items-center text-sm font-medium text-foreground">{content}</span>
      </li>
    );
  }

  return (
    <li className={cn('min-w-0 max-w-[min(100%,12rem)] shrink-0', className)}>
      <Link
        href={href}
        className="inline-flex min-h-9 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {content}
      </Link>
    </li>
  );
}

export interface BreadcrumbEllipsisProps {
  className?: string;
}

export function BreadcrumbEllipsis({ className }: BreadcrumbEllipsisProps) {
  return (
    <li aria-hidden className={cn('inline-flex min-h-9 items-center px-0.5 text-sm text-muted-foreground', className)}>
      …
    </li>
  );
}

export interface BreadcrumbProps {
  items: BreadcrumbItemData[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

/** ODS breadcrumb trail — responsive collapse, truncates long labels. */
export function Breadcrumb({ items, className, showHome = false, homeHref = '/dashboard' }: BreadcrumbProps) {
  const density = useBreadcrumbDensity();
  const trail = React.useMemo(() => {
    const withHome: BreadcrumbItemData[] = showHome
      ? [{ label: 'Home', href: homeHref, icon: Home }, ...items]
      : items;
    return getBreadcrumbSegments(withHome, density);
  }, [density, homeHref, items, showHome]);

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('w-full max-w-full overflow-hidden', className)}>
      <ol className="flex min-w-0 flex-nowrap items-center gap-1">
        {trail.map((segment, index) => (
          <React.Fragment key={`${segment.type}-${index}`}>
            {index > 0 ? (
              <li className="inline-flex min-h-9 items-center" aria-hidden>
                <BreadcrumbSeparator />
              </li>
            ) : null}
            {segment.type === 'ellipsis' ? (
              <BreadcrumbEllipsis />
            ) : segment.type === 'link' ? (
              <BreadcrumbItem href={segment.href} icon={segment.icon}>
                {segment.label}
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem isCurrent icon={segment.icon}>
                {segment.label}
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
