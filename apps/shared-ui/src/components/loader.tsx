'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';

const skeletonBase = 'ods-shimmer rounded-md motion-reduce:animate-none motion-reduce:bg-muted';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const spinnerSizes: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

/** ODS spinning indicator — primary token, linear animation. */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary motion-reduce:animate-none', spinnerSizes[size], className)}
      aria-hidden={label ? true : undefined}
      aria-label={label}
      role={label ? 'status' : undefined}
    />
  );
}

export interface InlineLoaderProps {
  label?: string;
  size?: SpinnerProps['size'];
  className?: string;
}

/** Inline loader — spinner + label, fixed min-height to avoid layout shift. */
export function InlineLoader({ label = 'Loading…', size = 'md', className }: InlineLoaderProps) {
  return (
    <Flex
      gap="sm"
      align="center"
      className={cn('min-h-10 text-sm text-muted-foreground', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={size} />
      <span>{label}</span>
    </Flex>
  );
}

export interface PageLoaderProps {
  label?: string;
  className?: string;
}

/** Centered content-area loader (does not cover shell sidebar/topbar). */
export function PageLoader({ label = 'Loading…', className }: PageLoaderProps) {
  return (
    <Flex
      align="center"
      justify="center"
      className={cn('min-h-[12rem] w-full py-12', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Stack gap="md" align="center">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </Stack>
    </Flex>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn(skeletonBase, className)} aria-hidden {...props} />;
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: 'full' | 'medium' | 'short';
}

const lineWidths: Record<NonNullable<SkeletonTextProps['lastLineWidth']>, string> = {
  full: 'w-full',
  medium: 'w-4/5',
  short: 'w-2/5',
};

/** Skeleton text lines — matches body-sm line height. */
export function SkeletonText({ lines = 3, className, lastLineWidth = 'medium' }: SkeletonTextProps) {
  return (
    <Stack gap="sm" className={className} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? lineWidths[lastLineWidth] : 'w-full')}
        />
      ))}
    </Stack>
  );
}

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarSizes: Record<NonNullable<SkeletonAvatarProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  return <Skeleton className={cn('rounded-full', avatarSizes[size], className)} />;
}

export interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

/** Card-shaped skeleton — border, radius, padding match ODS Card. */
export function SkeletonCard({ className, lines = 3, showHeader = true }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-sm',
        className,
      )}
      aria-hidden
    >
      <Stack gap="md">
        {showHeader ? (
          <Stack gap="sm">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </Stack>
        ) : null}
        <SkeletonText lines={lines} />
      </Stack>
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/** Table skeleton inside ODS table shell — matches admin table min-width. */
export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-card shadow-sm',
        className,
      )}
      aria-hidden
    >
      <div className="min-w-[36rem] p-4">
        <div className="mb-4 flex gap-4 border-b border-border pb-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`head-${index}`} className="h-4 flex-1" />
          ))}
        </div>
        <Stack gap="md">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={`${rowIndex}-${colIndex}`}
                  className={cn('h-4 flex-1', colIndex === 0 && 'max-w-[40%]')}
                />
              ))}
            </div>
          ))}
        </Stack>
      </div>
    </div>
  );
}

export interface ChartSkeletonProps {
  className?: string;
  height?: 'sm' | 'md' | 'lg';
}

const chartHeights: Record<NonNullable<ChartSkeletonProps['height']>, string> = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-56',
};

/** Chart area skeleton — bar placeholders in Card shell. */
export function ChartSkeleton({ className, height = 'md' }: ChartSkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-6 shadow-sm', className)} aria-hidden>
      <Stack gap="md">
        <Skeleton className="h-5 w-1/3" />
        <Flex gap="sm" align="end" className={cn(chartHeights[height], 'w-full pt-2')}>
          {['h-14', 'h-28', 'h-20', 'h-32', 'h-24', 'h-28', 'h-16'].map((barClass, index) => (
            <Skeleton key={index} className={cn('w-full flex-1', barClass)} />
          ))}
        </Flex>
      </Stack>
    </div>
  );
}
