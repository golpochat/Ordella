import { PageHeader } from '@/components/ui/page-header';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { SupportInboxPanel } from '@/components/support/support-inbox-panel';
import { fetchSupportAnalytics, listCannedResponses, listSupportTickets } from '@/lib/api/admin/support';
import { createServerApiClient } from '@/lib/api/server';
import { getErrorMessage } from '@/lib/utils';

export default async function SupportPage() {
  const api = createServerApiClient();
  let tickets: Awaited<ReturnType<typeof listSupportTickets>> = [];
  let analytics: Awaited<ReturnType<typeof fetchSupportAnalytics>> = {
    totalTickets: 0,
    openTickets: 0,
    averageResolutionHours: 0,
    slaCompliance: 100,
    volumeByCategory: [],
    staffPerformance: [],
    csatAverage: null,
  };
  let cannedResponses: Awaited<ReturnType<typeof listCannedResponses>> = [];
  let error: string | null = null;

  try {
    [tickets, analytics, cannedResponses] = await Promise.all([
      listSupportTickets(api),
      fetchSupportAnalytics(api),
      listCannedResponses(api),
    ]);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Support Inbox" description="Manage customer tickets, SLA risk, assignments, and support conversations." />
      {error ? <ApiErrorBanner message={error} /> : null}
      {!error && !tickets.length ? <EmptyState title="No support tickets" description="Customer support requests will appear here." /> : null}
      <SupportInboxPanel initialTickets={tickets} analytics={analytics} cannedResponses={cannedResponses} />
    </div>
  );
}
