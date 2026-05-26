import { createServerApiClient } from '@/lib/api/server';
import { getAnalyticsInsightsDashboard, type AnalyticsInsightsParams } from '@/lib/api/admin/analytics-insights';
import { AnalyticsInsightsPanel } from '@/components/analytics-insights/analytics-insights-panel';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { getErrorMessage } from '@/lib/utils';

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
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Insights"
        description="Basket affinity, segmentation, LTV, churn, and cohort intelligence for marketing and recommendations."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {dashboard ? <AnalyticsInsightsPanel dashboard={dashboard} /> : null}
    </div>
  );
}
