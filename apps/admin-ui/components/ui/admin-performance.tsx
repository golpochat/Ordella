'use client';

import * as React from 'react';
import useSWR, { preload, SWRConfig, type SWRConfiguration, type Key } from 'swr';
import { useReportWebVitals } from 'next/web-vitals';
import {
  AsyncBoundary,
  LazyMount,
  VirtualizedList,
  useDebouncedValue,
  useStableCallback,
  ODS_DEBOUNCE_MS,
} from '@shared-ui';

export {
  AsyncBoundary,
  LazyMount,
  VirtualizedList,
  useDebouncedValue,
  useStableCallback,
  ODS_DEBOUNCE_MS,
};

export type AdminPerformanceProviderProps = {
  children: React.ReactNode;
};

const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5_000,
  focusThrottleInterval: 10_000,
  errorRetryCount: 2,
  keepPreviousData: true,
};

function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'development') return;
    const slow = metric.name === 'LCP' || metric.name === 'INP' || metric.name === 'CLS';
    if (slow) {
      console.info(`[ODS Web Vital] ${metric.name}`, Math.round(metric.value), metric.rating);
    }
  });
  return null;
}

/** Global SWR defaults + Web Vitals (dev logging). */
export function AdminPerformanceProvider({ children }: AdminPerformanceProviderProps) {
  return (
    <SWRConfig value={DEFAULT_SWR_CONFIG}>
      <WebVitalsReporter />
      {children}
    </SWRConfig>
  );
}

export type UseAdminQueryOptions<T> = SWRConfiguration<T> & {
  enabled?: boolean;
};

/**
 * Cached client query — dedupes, stale-while-revalidate, optional optimistic mutate.
 */
export function useAdminQuery<T>(
  key: Key | null,
  fetcher: () => Promise<T>,
  options?: UseAdminQueryOptions<T>,
) {
  const { enabled = true, ...swrOptions } = options ?? {};
  const stableFetcher = useStableCallback(fetcher);

  return useSWR<T>(enabled && key ? key : null, stableFetcher, swrOptions);
}

export type UseDebouncedAdminQueryOptions<T> = UseAdminQueryOptions<T> & {
  debounceMs?: number;
};

/** Debounced key — defers fetch until search/filter settles. */
export function useDebouncedAdminQuery<T>(
  key: Key | null,
  fetcher: () => Promise<T>,
  debounceMs = ODS_DEBOUNCE_MS,
  options?: UseDebouncedAdminQueryOptions<T>,
) {
  const keyString = key === null ? null : JSON.stringify(key);
  const debouncedKey = useDebouncedValue(keyString, debounceMs);
  const parsedKey = React.useMemo(() => {
    if (!debouncedKey) return null;
    try {
      return JSON.parse(debouncedKey) as Key;
    } catch {
      return debouncedKey;
    }
  }, [debouncedKey]);

  return useAdminQuery<T>(parsedKey, fetcher, options);
}

/** Prefetch SWR data on hover (e.g. nav links). */
export function prefetchAdminQuery<T>(key: Key, fetcher: () => Promise<T>) {
  void preload(key, fetcher);
}
