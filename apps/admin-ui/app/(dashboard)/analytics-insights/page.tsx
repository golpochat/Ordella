import { createServerApiClient } from '@/lib/api/server';
import { getAnalyticsInsightsDashboard, type AnalyticsInsightsParams } from '@/lib/api/admin/analytics-insights';
import { AnalyticsInsightsPanel } from '@/components/analytics-insights/analytics-insights-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

type AnalyticsInsightsPageProps = {
  searchParams: AnalyticsInsightsParams;
};

export default async function AnalyticsInsightsPage({ searchParams }: AnalyticsInsightsPageProps) {
  let dashboard: Awaited<ReturnType<typeof getAnalyticsInsightsDashboard>> | null = null;
  let error: string | null = null;
  try {
    dashboard = await getAnalyticsInsightsDashboard(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title="Analytics & Insights"
        description="Basket affinity, segmentation, LTV, churn, and cohort intelligence for marketing and recommendations."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {dashboard ? (
        <PageSection title="Analytics dashboard">
          <AnalyticsInsightsPanel dashboard={dashboard} />
        </PageSection>
      ) : null}
    </Stack>
  );
}
