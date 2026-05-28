import { createServerApiClient } from '@/lib/api/server';
import { getForecastSummary, type ForecastParams } from '@/lib/api/admin/forecasting';
import { ForecastingDashboardPanel } from '@/components/forecasting/forecasting-dashboard-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { DetailPageHeader } from '@/components/ui/admin-detail';
import { getErrorMessage } from '@/lib/utils';
import { Card, CardContent, Grid, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <DetailPageHeader
        breadcrumb={[
          { label: 'Forecasting', href: '/forecasting' },
          { label: 'Location forecast' },
        ]}
        title="Location forecast breakdown"
        description="Demand, staffing peaks, inventory risk, and warehouse planning for a single location."
      />

      <PageSection title="Primary details">
        <Grid cols={1} gap="md">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Location ID</p>
              <p className="mt-2 break-all font-medium text-foreground">{params.id}</p>
            </CardContent>
          </Card>
        </Grid>
      </PageSection>

      {error ? <ApiErrorBanner message={error} /> : null}

      <PageSection title="Forecast dashboard">
        <ForecastingDashboardPanel forecast={forecast} />
      </PageSection>
    </Stack>
  );
}
