'use client';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbIcon,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Stack,
  getBreadcrumbSegments,
  type BreadcrumbItemData,
  type BreadcrumbProps,
} from '@shared-ui';
import { cn } from '@shared-ui';
import { PageHeader, type AdminPageHeaderProps } from '@/components/ui/admin-page-header';

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbIcon,
  BreadcrumbItem,
  BreadcrumbSeparator,
  getBreadcrumbSegments,
};
export type { BreadcrumbItemData, BreadcrumbProps };

/** Admin alias for ODS Breadcrumb. */
export const AdminBreadcrumb = Breadcrumb;

export type DetailPageHeaderProps = AdminPageHeaderProps & {
  breadcrumb: BreadcrumbItemData[];
};

/** Breadcrumb above PageHeader — standard detail / drill-down layout. */
export function DetailPageHeader({ breadcrumb, className, ...headerProps }: DetailPageHeaderProps) {
  return (
    <Stack gap="sm" className="min-w-0">
      <Breadcrumb items={breadcrumb} />
      <PageHeader {...headerProps} className={cn('mb-0', className)} />
    </Stack>
  );
}
