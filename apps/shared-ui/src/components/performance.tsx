'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { cn } from '../lib/utils';
import { getVirtualRange, ODS_DEBOUNCE_MS } from '../lib/performance-utils';
import { Skeleton } from './loader';
import { Stack } from './layout/stack';

export { debounce, throttle, getVirtualRange, ODS_DEBOUNCE_MS, ODS_THROTTLE_MS } from '../lib/performance-utils';

export type AsyncBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Accessible label while loading. */
  loadingLabel?: string;
  className?: string;
};

/** Suspense + skeleton fallback for async / lazy children. */
export function AsyncBoundary({
  children,
  fallback,
  loadingLabel = 'Loading content',
  className,
}: AsyncBoundaryProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <Suspense
        fallback={
          fallback ?? (
            <Stack gap="md" aria-busy="true" aria-label={loadingLabel}>
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-48 w-full" />
            </Stack>
          )
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

export type LazyMountProps = {
  children: React.ReactNode;
  /** Placeholder until visible in viewport. */
  placeholder?: React.ReactNode;
  rootMargin?: string;
  className?: string;
};

/** Defer rendering until near viewport (reduces initial work). */
export function LazyMount({
  children,
  placeholder,
  rootMargin = '200px',
  className,
}: LazyMountProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder ?? <Skeleton className="h-32 w-full" aria-hidden />}
    </div>
  );
}

export type VirtualizedListProps<T> = {
  items: T[];
  itemHeight: number;
  maxHeight?: number;
  overscan?: number;
  className?: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
};

/** Windowed list — renders only visible rows (+ overscan). */
export function VirtualizedList<T>({
  items,
  itemHeight,
  maxHeight = 480,
  overscan = 4,
  className,
  getKey,
  renderItem,
  emptyState,
}: VirtualizedListProps<T>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const onScroll = React.useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    setScrollTop(node.scrollTop);
  }, []);

  if (!items.length) {
    return <div className={className}>{emptyState ?? null}</div>;
  }

  const range = getVirtualRange(scrollTop, maxHeight, items.length, itemHeight, overscan);
  const slice = items.slice(range.start, range.end);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={cn('relative w-full overflow-auto', className)}
      style={{ maxHeight }}
    >
      <div style={{ height: range.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${range.offsetTop}px)` }}>
          {slice.map((item, index) => (
            <div key={getKey(item, range.start + index)} style={{ height: itemHeight }}>
              {renderItem(item, range.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useDebouncedValue<T>(value: T, delayMs = ODS_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useStableCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = React.useRef(fn);
  ref.current = fn;
  return React.useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, []);
}
