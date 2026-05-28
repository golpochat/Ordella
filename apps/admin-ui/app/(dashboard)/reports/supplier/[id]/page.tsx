import { createServerApiClient } from '@/lib/api/server';
import { getReportDrilldown, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { DetailPageHeader } from '@/components/ui/admin-detail';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { Card, CardContent, Grid, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <DetailPageHeader
        breadcrumb={[
          { label: 'Reports', href: '/reports' },
          { label: 'Supplier metrics' },
        ]}
        title="Supplier metrics"
        description="Lead times, on-time delivery, rejection rate, and spend for a single supplier."
        tabs={<SubNav variant="embedded" items={REPORTS_SUBNAV} />}
      />

      <PageSection title="Primary details">
        <Grid cols={1} gap="md">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Supplier ID</p>
              <p className="mt-2 break-all font-medium text-foreground">{params.id}</p>
            </CardContent>
          </Card>
        </Grid>
      </PageSection>

      {error ? <ApiErrorBanner message={error} /> : null}

      <PageSection title="Report dashboard">
        <EnterpriseReportsPanel report={report} />
      </PageSection>
    </Stack>
  );
}
