import Link from 'next/link';
import { Card, CardContent } from '@shared-ui';
import { createServerApiClient } from '@/lib/api/server';
import { getForecastSummary, type ForecastParams } from '@/lib/api/admin/forecasting';
import { ForecastingDashboardPanel } from '@/components/forecasting/forecasting-dashboard-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

type LocationForecastPageProps = {
  params: { id: string };
  searchParams: ForecastParams;
};

export default async function LocationForecastPage({ params, searchParams }: LocationForecastPageProps) {
  let forecast: Record<string, unknown> = {};
  let error: string | null = null;
  try {
    forecast = await getForecastSummary(createServerApiClient(), {
      ...searchParams,
      locationId: params.id,
    });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Location Forecast Breakdown"
        description="Demand, staffing peaks, inventory risk, and warehouse planning for a single location."
      />
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span className="text-muted-foreground">Location ID: {params.id}</span>
          <Link className="font-medium text-primary hover:underline" href="/forecasting">
            Back to forecasting
          </Link>
        </CardContent>
      </Card>
      {error ? <ApiErrorBanner message={error} /> : null}
      <ForecastingDashboardPanel forecast={forecast} />
    </>
  );
}
