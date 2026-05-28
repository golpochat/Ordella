'use client';

import * as React from 'react';
import {
  ContentArea,
  Flex,
  Grid,
  PageContainer,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderTabs,
  PageHeaderTitle,
  PageSection,
  Stack,
  TopNav,
  type ContentAreaProps,
  type GridProps,
  type PageContainerProps,
  type PageHeaderProps,
  type PageSectionProps,
  type TopNavProps,
} from '@shared-ui';
import { cn } from '@shared-ui';
import { PageTransition } from '@/components/ui/admin-motion';

export {
  ContentArea,
  Flex,
  Grid,
  PageContainer,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderTabs,
  PageHeaderTitle,
  PageSection,
  Stack,
  TopNav,
};
export type {
  ContentAreaProps,
  GridProps,
  PageContainerProps,
  PageHeaderProps,
  PageSectionProps,
  TopNavProps,
};

/** @deprecated Use `TopNav`. */
export { TopNav as AdminTopNav };

export { Sidebar } from '@shared-ui';

export type AdminPageProps = {
  children: React.ReactNode;
  className?: string;
  /** Inner max-width (`none` = full-width tables). */
  maxWidth?: ContentAreaProps['maxWidth'];
};

/**
 * Standard admin page column — use inside dashboard shell (ContentArea wraps automatically).
 * Prefer fragments + PageHeader + panels; use this when you need an explicit wrapper.
 */
export function AdminPage({ children, className, maxWidth = 'none' }: AdminPageProps) {
  return (
    <ContentArea maxWidth={maxWidth} className={className}>
      {children}
    </ContentArea>
  );
}

export type AdminPageChromeProps = {
  breadcrumb?: React.ReactNode;
  header: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
};

/** Breadcrumb → header → filters stack (8px grid spacing). */
export function AdminPageChrome({ breadcrumb, header, filters, className }: AdminPageChromeProps) {
  return (
    <Stack gap="md" className={cn('min-w-0', className)}>
      {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}
      {header}
      {filters ? <div className="min-w-0">{filters}</div> : null}
    </Stack>
  );
}

export type AdminPageFiltersProps = {
  children: React.ReactNode;
  className?: string;
};

/** Filter / search row under page header. */
export function AdminPageFilters({ children, className }: AdminPageFiltersProps) {
  return (
    <Flex gap="md" wrap align="center" className={cn('min-w-0 w-full', className)}>
      {children}
    </Flex>
  );
}

export type AdminPageContentProps = {
  children: React.ReactNode;
  className?: string;
};

/** Primary page body (tables, cards, panels). */
export function AdminPageContent({ children, className }: AdminPageContentProps) {
  return (
    <PageTransition className={cn('min-w-0 w-full', className)}>{children}</PageTransition>
  );
}

/** Standard vertical rhythm for list/dashboard panels. */
export function AdminPanelStack({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Stack gap="lg" className={cn('min-w-0', className)}>
      {children}
    </Stack>
  );
}
