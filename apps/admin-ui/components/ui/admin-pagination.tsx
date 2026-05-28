'use client';

import { useRouter } from 'next/navigation';
import {
  Pagination,
  PaginationButton,
  PaginationControls,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
  getPaginationItems,
  type PaginationProps,
} from '@shared-ui';

export {
  Pagination,
  PaginationButton,
  PaginationControls,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
  getPaginationItems,
};
export type { PaginationProps };

/** Admin alias for ODS Pagination. */
export const AdminPagination = Pagination;

export type AdminUrlPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
  pageParam?: string;
  pageSizeParam?: string;
  pageSizeOptions?: number[];
  className?: string;
};

/** URL-driven pagination for server-rendered list pages (audit logs, orders, etc.). */
export function AdminUrlPagination({
  page,
  pageSize,
  total,
  searchParams,
  pageParam = 'page',
  pageSizeParam = 'limit',
  pageSizeOptions,
  className,
}: AdminUrlPaginationProps) {
  const router = useRouter();

  function pushParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    mutator(params);
    const query = params.toString();
    router.push(query ? `?${query}` : '?');
  }

  return (
    <AdminPagination
      className={className}
      page={page}
      pageSize={pageSize}
      total={total}
      pageSizeOptions={pageSizeOptions}
      onPageChange={(nextPage) => {
        pushParams((params) => {
          params.set(pageParam, String(nextPage));
        });
      }}
      onPageSizeChange={
        pageSizeOptions
          ? (nextSize) => {
              pushParams((params) => {
                params.set(pageSizeParam, String(nextSize));
                params.set(pageParam, '1');
              });
            }
          : undefined
      }
    />
  );
}
