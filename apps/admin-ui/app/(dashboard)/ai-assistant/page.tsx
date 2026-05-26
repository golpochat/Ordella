import { AiAssistantPanel } from '@/components/ai-assistant/ai-assistant-panel';
import {
  getAiAnalytics,
  listAiActions,
  listAiAutomationSettings,
  listAiConversations,
  listAiInsights,
} from '@/lib/api/admin/ai-assistant';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';

export default async function AiAssistantPage() {
  const api = createServerApiClient();
  let error: string | null = null;
  let conversations: Awaited<ReturnType<typeof listAiConversations>> = [];
  let insights: Awaited<ReturnType<typeof listAiInsights>> = [];
  let actions: Awaited<ReturnType<typeof listAiActions>> = [];
  let settings: Awaited<ReturnType<typeof listAiAutomationSettings>> = [];
  let analytics: Awaited<ReturnType<typeof getAiAnalytics>> | null = null;

  try {
    [conversations, insights, actions, settings, analytics] = await Promise.all([
      listAiConversations(api),
      listAiInsights(api),
      listAiActions(api),
      listAiAutomationSettings(api),
      getAiAnalytics(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Ask operational questions, explain forecasts, review AI insights, and approve automation before critical actions execute."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      <AiAssistantPanel
        conversations={conversations}
        insights={insights}
        actions={actions}
        settings={settings}
        analytics={analytics}
      />
    </div>
  );
}
