'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/admin-loader';

/** Lazy-loaded chart widgets — keeps chart CSS/layout out of the initial bundle. */
export const HorizontalBarChartLazy = dynamic(
  () => import('@/components/ui/admin-chart').then((m) => m.HorizontalBarChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);
