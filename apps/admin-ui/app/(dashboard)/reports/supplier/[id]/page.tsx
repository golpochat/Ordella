import { createServerApiClient } from '@/lib/api/server';
import { getReportDrilldown, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';

type SupplierReportPageProps = {
  params: { id: string };
  searchParams: EnterpriseReportParams;
};

export default async function SupplierReportPage({ params, searchParams }: SupplierReportPageProps) {
  let report: Record<string, unknown> = {};
  let error: string | null = null;

  try {
    report = await getReportDrilldown(createServerApiClient(), 'supplier', params.id, searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Supplier metrics" description={`Lead times, on-time delivery, rejection rate, and spend for supplier ${params.id}.`} />
      <SubNav items={REPORTS_SUBNAV} />
      {error ? <ApiErrorBanner message={error} /> : null}
      <EnterpriseReportsPanel report={report} />
    </>
  );
}
