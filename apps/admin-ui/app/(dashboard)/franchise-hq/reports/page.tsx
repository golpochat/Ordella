import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getEnterpriseSummary, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { PageHeader } from '@/components/ui/page-header';
import { ReportExplorerControls } from '@/components/reports/report-explorer-controls';
import { SubNav } from '@/components/ui/sub-nav';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type FranchiseHqReportsPageProps = {
  searchParams: EnterpriseReportParams;
};

export default async function FranchiseHqReportsPage({ searchParams }: FranchiseHqReportsPageProps) {
  let report: Record<string, unknown> = {};
  let error: string | null = null;
  try {
    report = await getEnterpriseSummary(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="HQ Reports"
        description="Consolidated operational reporting for location comparison, zone coverage, and export-ready executive reviews."
      />
      <SubNav items={FRANCHISE_HQ_SUBNAV} />
      <Suspense fallback={null}>
        <ReportExplorerControls />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      <EnterpriseReportsPanel report={report} />
    </>
  );
}
