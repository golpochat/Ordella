import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getForecastSummary, type ForecastParams } from '@/lib/api/admin/forecasting';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { ForecastingControls } from '@/components/forecasting/forecasting-controls';
import { ForecastingDashboardPanel } from '@/components/forecasting/forecasting-dashboard-panel';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type HqForecastingPageProps = {
  searchParams: ForecastParams;
};

export default async function HqForecastingPage({ searchParams }: HqForecastingPageProps) {
  let forecast: Record<string, unknown> = {};
  let error: string | null = null;
  try {
    forecast = await getForecastSummary(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="HQ Forecasting"
        description="Compare predictive demand, replenishment, delivery, and staffing outlooks across locations."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      <Suspense fallback={null}>
        <ForecastingControls />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      <ForecastingDashboardPanel forecast={forecast} />
    </>
  );
}
