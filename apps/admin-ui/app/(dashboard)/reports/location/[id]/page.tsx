import { createServerApiClient } from '@/lib/api/server';
import { getReportDrilldown, type EnterpriseReportParams } from '@/lib/api/admin/reports';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { DetailPageHeader } from '@/components/ui/admin-detail';
import { SubNav } from '@/components/ui/sub-nav';
import { EnterpriseReportsPanel } from '@/components/reports/enterprise-reports-panel';
import { REPORTS_SUBNAV } from '@/lib/navigation';
import { getErrorMessage } from '@/lib/utils';
import { Card, CardContent, Grid, PageSection, Stack } from '@shared-ui';

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
    <Stack gap="lg">
      <DetailPageHeader
        breadcrumb={[
          { label: 'Reports', href: '/reports' },
          { label: 'Location performance' },
        ]}
        title="Location performance"
        description="Sales, inventory, delivery, and supplier metrics for a single location."
        tabs={<SubNav variant="embedded" items={REPORTS_SUBNAV} />}
      />

      <PageSection title="Primary details">
        <Grid cols={1} gap="md">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Location ID</p>
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
