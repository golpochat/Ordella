import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getDeliveryReport } from '@/lib/api/admin/reports';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

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
    <>
      <PageHeader title="Delivery performance" description="Completion rates and timing" />
      <SubNav items={REPORTS_SUBNAV} />
      <Suspense fallback={null}>
        <ReportDateFilter />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {tableRows.length === 0 && !error ? (
        <EmptyState title="No data" description="Delivery metrics will appear here." />
      ) : (
        <ReportTable columns={['date', 'completed', 'failed', 'avgTime']} rows={tableRows} />
      )}
    </>
  );
}
