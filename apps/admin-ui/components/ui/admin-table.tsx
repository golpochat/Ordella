'use client';

import * as React from 'react';
import {
  EmptyState,
  Pagination,
  PaginationButton,
  PaginationControls,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
  SortableTableHead,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type EmptyStateProps,
  type PaginationButtonProps,
  type PaginationControlsProps,
  type PaginationProps,
  type SortDirection,
  type SortableTableHeadProps,
} from '@shared-ui';
import { PageSection, Stack } from '@shared-ui';
import { TableRowShortcutScope } from '@/components/ui/admin-shortcuts';

export {
  EmptyState,
  Pagination,
  PaginationButton,
  PaginationControls,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
  SortableTableHead,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type EmptyStateProps,
  type PaginationButtonProps,
  type PaginationControlsProps,
  type PaginationProps,
  type SortDirection,
  type SortableTableHeadProps,
};

export { AdminPagination, AdminUrlPagination } from '@/components/ui/admin-pagination';

export type AdminTableShellProps = {
  title?: string;
  description?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Enable ↑/↓ row focus shortcuts within this table. */
  keyboardNavigation?: boolean;
};

/** PageSection + table or ODS EmptyState when there is no data. */
export function AdminTableShell({
  title,
  description,
  isEmpty,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear when data is available for this view.',
  emptyAction,
  children,
  footer,
  className,
  keyboardNavigation = false,
}: AdminTableShellProps) {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const tableRegionLabel = title;

  const body = isEmpty ? (
    <EmptyState
      title={emptyTitle}
      description={emptyDescription}
      action={emptyAction}
      size="default"
    />
  ) : (
    <>
      <TableRowShortcutScope containerRef={tableRef} enabled={keyboardNavigation} />
      <Stack
        ref={tableRef}
        gap="md"
        className={className}
        data-ods-table=""
        role={tableRegionLabel ? 'region' : undefined}
        aria-label={tableRegionLabel}
      >
        {children}
        {footer}
      </Stack>
    </>
  );

  if (title) {
    return (
      <PageSection title={title} description={description}>
        {body}
      </PageSection>
    );
  }

  return body;
}

/** Table row that participates in ODS ↑/↓ keyboard navigation. */
export function AdminFocusableTableRow({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      tabIndex={0}
      data-ods-table-row=""
      className={className}
      {...props}
    >
      {children}
    </TableRow>
  );
}

export function TableEmptyRow({
  colSpan,
  title = 'Nothing here yet',
  description = 'Records will appear when data is available for this view.',
}: {
  colSpan: number;
  title?: string;
  description?: string;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <EmptyState title={title} description={description} size="compact" className="max-w-none border-0 shadow-none" />
      </TableCell>
    </TableRow>
  );
}
