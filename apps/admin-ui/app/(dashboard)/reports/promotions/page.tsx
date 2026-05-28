import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getPromotionUsageReport } from '@/lib/api/admin/reports';
import { SubNav } from '@/components/ui/sub-nav';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportTable } from '@/components/reports/report-table';
import { ReportDateFilter } from '@/components/reports/report-date-filter';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { formatMoney, getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <PageHeader title="Promotion usage" description="Discount applications by day"
        tabs={<SubNav variant="embedded" items={REPORTS_SUBNAV} />} />
      <PageSection title="Date range">
        <Suspense fallback={null}>
          <ReportDateFilter />
        </Suspense>
      </PageSection>
      {error ? <ApiErrorBanner message={error} /> : null}
      <PageSection title="Results">
        {tableRows.length === 0 && !error ? (
          <EmptyState title="No promotion usage" description="Promotion metrics will appear for the selected range." />
        ) : (
          <ReportTable columns={['date', 'promotionId', 'applications', 'discount']} rows={tableRows} />
        )}
      </PageSection>
    </Stack>
  );
}
