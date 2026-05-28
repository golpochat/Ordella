import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getDeliveryReport } from '@/lib/api/admin/reports';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

type DeliveryReportPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function DeliveryReportPage({ searchParams }: DeliveryReportPageProps) {
  let rows: Awaited<ReturnType<typeof getDeliveryReport>> = [];
  let error: string | null = null;

  try {
    rows = await getDeliveryReport(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  const tableRows = rows.map((r) => ({
    date: r.date,
    completed: r.completed,
    failed: r.failed,
    avgTime: r.avgDeliveryTime,
  }));

  return (
    <Stack gap="lg">
      <PageHeader title="Delivery performance" description="Completion rates and timing"
        tabs={<SubNav variant="embedded" items={REPORTS_SUBNAV} />} />
      <PageSection title="Date range">
        <Suspense fallback={null}>
          <ReportDateFilter />
        </Suspense>
      </PageSection>
      {error ? <ApiErrorBanner message={error} /> : null}
      <PageSection title="Results">
        {tableRows.length === 0 && !error ? (
          <EmptyState title="No delivery metrics" description="Delivery performance will appear for the selected range." />
        ) : (
          <ReportTable columns={['date', 'completed', 'failed', 'avgTime']} rows={tableRows} />
        )}
      </PageSection>
    </Stack>
  );
}
