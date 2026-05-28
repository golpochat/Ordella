import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getForecastSummary, type ForecastParams } from '@/lib/api/admin/forecasting';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { ForecastingControls } from '@/components/forecasting/forecasting-controls';
import { ForecastingDashboardPanel } from '@/components/forecasting/forecasting-dashboard-panel';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <PageHeader
        title="AI Forecasting"
        description="Predict demand, stockouts, staffing, delivery capacity, and warehouse replenishment needs."
      />
      <PageSection title="Forecast filters">
        <Suspense fallback={null}>
          <ForecastingControls />
        </Suspense>
      </PageSection>
      {error ? <ApiErrorBanner message={error} /> : null}
      <PageSection title="Forecast results">
        <ForecastingDashboardPanel forecast={forecast} />
      </PageSection>
    </Stack>
  );
}
