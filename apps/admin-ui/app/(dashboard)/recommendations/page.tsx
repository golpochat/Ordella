import { createServerApiClient } from '@/lib/api/server';
import {
  getRecommendationAnalytics,
  getRecommendationSettings,
  type RecommendationAnalytics,
  type RecommendationSettings,
} from '@/lib/api/admin/recommendations';
import { PageHeader } from '@/components/ui/page-header';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { AiRecommendationsPanel } from '@/components/recommendations/ai-recommendations-panel';
import { getErrorMessage } from '@/lib/utils';

export default async function RecommendationsPage() {
  const api = createServerApiClient();
  let analytics: RecommendationAnalytics | null = null;
  let settings: RecommendationSettings | null = null;
  let error: string | null = null;

  try {
    [analytics, settings] = await Promise.all([
      getRecommendationAnalytics(api),
      getRecommendationSettings(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="AI Recommendations"
        description="Measure recommendation performance, tune personalization, and manage subtle upsells across storefront and POS."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <AiRecommendationsPanel analytics={analytics} settings={settings} />
    </>
  );
}
