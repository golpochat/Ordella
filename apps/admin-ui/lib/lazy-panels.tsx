'use client';

import dynamic from 'next/dynamic';
import {
  PanelCardsSkeleton,
  SuspenseDashboardFallback,
  TablePanelSkeleton,
} from '@/components/ui/admin-loader';

/** Code-split heavy client panels — reduces initial route JS. */
export const OrchestrationPanelLazy = dynamic(
  () => import('@/components/orchestration/orchestration-panel').then((m) => m.OrchestrationPanel),
  { loading: () => <PanelCardsSkeleton count={2} />, ssr: false },
);

export const CrmDashboardPanelLazy = dynamic(
  () => import('@/components/crm/crm-dashboard-panel').then((m) => m.CrmDashboardPanel),
  { loading: () => <SuspenseDashboardFallback />, ssr: true },
);

export const IntegrationsHubPanelLazy = dynamic(
  () => import('@/components/integrations/integrations-hub-panel').then((m) => m.IntegrationsHubPanel),
  { loading: () => <PanelCardsSkeleton count={3} />, ssr: false },
);

export const LowStockPanelLazy = dynamic(
  () => import('@/components/inventory/low-stock-panel').then((m) => m.LowStockPanel),
  { loading: () => <TablePanelSkeleton rows={6} columns={5} />, ssr: false },
);
