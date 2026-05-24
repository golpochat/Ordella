import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getPromotionUsageReport } from '@/lib/api/admin/reports';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { formatMoney, getErrorMessage } from '@/lib/utils';

type PromotionReportPageProps = {
  searchParams: { from?: string; to?: string };
};

export default async function PromotionReportPage({ searchParams }: PromotionReportPageProps) {
  let rows: Awaited<ReturnType<typeof getPromotionUsageReport>> = [];
  let error: string | null = null;

  try {
    rows = await getPromotionUsageReport(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  const tableRows = rows.map((r) => ({
    date: r.date,
    promotionId: r.promotionId,
    applications: r.applicationCount,
    discount: formatMoney(r.totalDiscount),
  }));

  return (
    <>
      <PageHeader title="Promotion usage" description="Discount applications by day" />
      <SubNav items={REPORTS_SUBNAV} />
      <Suspense fallback={null}>
        <ReportDateFilter />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {tableRows.length === 0 && !error ? (
        <EmptyState title="No data" description="Promotion usage will appear here." />
      ) : (
        <ReportTable
          columns={['date', 'promotionId', 'applications', 'discount']}
          rows={tableRows}
        />
      )}
    </>
  );
}
