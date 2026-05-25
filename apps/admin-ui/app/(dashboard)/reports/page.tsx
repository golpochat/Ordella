import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import {
  getEnterpriseCustomers,
  getEnterpriseInventory,
  getEnterpriseSales,
  getEnterpriseSummary,
  getEnterpriseTax,
  type EnterpriseReportParams,
} from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { ReportExplorerControls } from '@/components/reports/report-explorer-controls';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type ReportsIndexPageProps = {
  searchParams: EnterpriseReportParams & { reportType?: string };
};

export default async function ReportsIndexPage({ searchParams }: ReportsIndexPageProps) {
  const api = createServerApiClient();
  const reportType = searchParams.reportType ?? 'summary';
  let report: Record<string, unknown> = {};
  let error: string | null = null;

  try {
    if (reportType === 'sales') report = await getEnterpriseSales(api, searchParams);
    else if (reportType === 'inventory') report = await getEnterpriseInventory(api, searchParams);
    else if (reportType === 'customers') report = await getEnterpriseCustomers(api, searchParams);
    else if (reportType === 'tax') report = await getEnterpriseTax(api, searchParams);
    else report = await getEnterpriseSummary(api, searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Enterprise Reports"
        description="Executive reporting across sales, inventory, tax, customers, delivery, and warehouse operations."
      />
      <SubNav items={REPORTS_SUBNAV} />
      <Suspense fallback={null}>
        <ReportExplorerControls />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      <EnterpriseReportsPanel report={report} />
    </>
  );
}
