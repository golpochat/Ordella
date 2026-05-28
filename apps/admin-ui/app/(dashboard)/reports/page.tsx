import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import {
  getEnterpriseCustomers,
  getEnterpriseInventory,
  getEnterpriseSales,
  getEnterpriseSummary,
  getEnterpriseTax,
  getReportingDashboard,
  type EnterpriseReportParams,
} from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { ReportExplorerControls } from '@/components/reports/report-explorer-controls';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

type ReportsIndexPageProps = {
  searchParams: EnterpriseReportParams & { reportType?: string };
};

export default async function ReportsIndexPage({ searchParams }: ReportsIndexPageProps) {
  const api = createServerApiClient();
  const reportType = searchParams.reportType ?? 'dashboard';
  let report: Record<string, unknown> = {};
  let error: string | null = null;

  try {
    if (reportType === 'dashboard') report = await getReportingDashboard(api, searchParams);
    else if (reportType === 'sales') report = await getEnterpriseSales(api, searchParams);
    else if (reportType === 'inventory') report = await getEnterpriseInventory(api, searchParams);
    else if (reportType === 'customers') report = await getEnterpriseCustomers(api, searchParams);
    else if (reportType === 'tax') report = await getEnterpriseTax(api, searchParams);
    else report = await getEnterpriseSummary(api, searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title="Reporting Dashboards"
        description="Unified sales, inventory, delivery, supplier, and promotion reporting with drill-downs and exports."
        tabs={<SubNav variant="embedded" items={REPORTS_SUBNAV} />}
      />
      <PageSection title="Report filters">
        <Suspense fallback={null}>
          <ReportExplorerControls />
        </Suspense>
      </PageSection>
      {error ? <ApiErrorBanner message={error} /> : null}
      <PageSection title="Report overview">
        <EnterpriseReportsPanel report={report} />
      </PageSection>
    </Stack>
  );
}
