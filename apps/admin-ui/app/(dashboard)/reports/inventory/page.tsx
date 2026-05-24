import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getInventoryReport } from '@/lib/api/admin/reports';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type InventoryReportPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function InventoryReportPage({ searchParams }: InventoryReportPageProps) {
  let rows: Awaited<ReturnType<typeof getInventoryReport>> = [];
  let error: string | null = null;

  try {
    rows = await getInventoryReport(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  const tableRows = rows.map((r) => ({
    date: r.date,
    productId: r.productId,
    in: r.quantityIn,
    out: r.quantityOut,
  }));

  return (
    <>
      <PageHeader title="Inventory movements" description="Stock in/out by day" />
      <SubNav items={REPORTS_SUBNAV} />
      <Suspense fallback={null}>
        <ReportDateFilter />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {tableRows.length === 0 && !error ? (
        <EmptyState title="No data" description="Inventory summaries will appear here." />
      ) : (
        <ReportTable columns={['date', 'productId', 'in', 'out']} rows={tableRows} />
      )}
    </>
  );
}
