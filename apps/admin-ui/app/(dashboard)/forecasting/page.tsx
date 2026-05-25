import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getForecastSummary, type ForecastParams } from '@/lib/api/admin/forecasting';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { ForecastingControls } from '@/components/forecasting/forecasting-controls';
import { ForecastingDashboardPanel } from '@/components/forecasting/forecasting-dashboard-panel';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

type ForecastingPageProps = {
  searchParams: ForecastParams;
};

export default async function ForecastingPage({ searchParams }: ForecastingPageProps) {
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
        title="AI Forecasting"
        description="Predict demand, stockouts, staffing, delivery capacity, and warehouse replenishment needs."
      />
      <Suspense fallback={null}>
        <ForecastingControls />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      <ForecastingDashboardPanel forecast={forecast} />
    </>
  );
}
