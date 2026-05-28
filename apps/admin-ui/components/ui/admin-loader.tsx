'use client';

import {
  ChartSkeleton,
  InlineLoader,
  PageLoader,
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  Spinner,
  Stack,
  type ChartSkeletonProps,
  type InlineLoaderProps,
  type PageLoaderProps,
  type SkeletonCardProps,
  type SkeletonTableProps,
} from '@shared-ui';

export {
  ChartSkeleton,
  InlineLoader,
  PageLoader,
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  Spinner,
};
export type { ChartSkeletonProps, InlineLoaderProps, PageLoaderProps, SkeletonCardProps, SkeletonTableProps };

/** Admin alias for ODS PageLoader. */
export const AdminPageLoader = PageLoader;

/** Admin alias for ODS InlineLoader. */
export const AdminInlineLoader = InlineLoader;

/** Default table panel loading state. */
export function TablePanelSkeleton({ rows = 6, columns = 5 }: SkeletonTableProps) {
  return (
    <div aria-busy="true" aria-label="Loading table">
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  );
}

/** Stacked cards skeleton for settings-style panels. */
export function PanelCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Stack gap="lg" aria-busy aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </Stack>
  );
}

/** Suspense fallback for filter + table pages. */
export function SuspenseTableFallback({ label }: { label?: string }) {
  return (
    <Stack gap="md" aria-busy aria-label={label ?? 'Loading'}>
      <Skeleton className="h-24 w-full" />
      <SkeletonTable rows={6} columns={5} />
    </Stack>
  );
}

/** Suspense fallback for dashboard analytics blocks. */
export function SuspenseDashboardFallback() {
  return (
    <Stack gap="lg" aria-busy aria-label="Loading analytics">
      <div className="grid gap-4 min-[481px]:grid-cols-2 min-[769px]:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <ChartSkeleton height="lg" />
    </Stack>
  );
}
