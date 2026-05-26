import { createServerApiClient } from '@/lib/api/server';
import { getReportDrilldown, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type LocationReportPageProps = {
  params: { id: string };
  searchParams: EnterpriseReportParams;
};

export default async function LocationReportPage({ params, searchParams }: LocationReportPageProps) {
  let report: Record<string, unknown> = {};
  let error: string | null = null;

  try {
    report = await getReportDrilldown(createServerApiClient(), 'location', params.id, searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Location performance" description={`Sales, inventory, delivery, and supplier metrics for location ${params.id}.`} />
      <SubNav items={REPORTS_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <EnterpriseReportsPanel report={report} />
    </>
  );
}
