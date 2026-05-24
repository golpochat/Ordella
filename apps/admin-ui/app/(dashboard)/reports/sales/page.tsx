import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getDailySales } from '@/lib/api/admin/reports';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { formatMoney, getErrorMessage } from '@/lib/utils';

type SalesReportPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function SalesReportPage({ searchParams }: SalesReportPageProps) {
  let rows: Awaited<ReturnType<typeof getDailySales>> = [];
  let error: string | null = null;

  try {
    rows = await getDailySales(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  const tableRows = rows.map((r) => ({
    date: r.date,
    orders: r.totalOrders,
    revenue: formatMoney(r.totalRevenue),
    discounts: formatMoney(r.totalDiscounts),
    refunds: formatMoney(r.totalRefunds),
  }));

  return (
    <>
      <PageHeader title="Daily sales" description="Revenue and order totals by day" />
      <SubNav items={REPORTS_SUBNAV} />
      <Suspense fallback={null}>
        <ReportDateFilter />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {tableRows.length === 0 && !error ? (
        <EmptyState title="No data" description="Sales summaries will appear for the selected range." />
      ) : (
        <ReportTable
          columns={['date', 'orders', 'revenue', 'discounts', 'refunds']}
          rows={tableRows}
        />
      )}
    </>
  );
}
