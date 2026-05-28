import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { getEnterpriseSummary, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { ReportExplorerControls } from '@/components/reports/report-explorer-controls';
import { SubNav } from '@/components/ui/sub-nav';
import { FRANCHISE_HQ_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <PageHeader
        title="HQ Reports"
        description="Consolidated operational reporting for location comparison, zone coverage, and export-ready executive reviews."
        tabs={<SubNav variant="embedded" items={FRANCHISE_HQ_SUBNAV} />}
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
