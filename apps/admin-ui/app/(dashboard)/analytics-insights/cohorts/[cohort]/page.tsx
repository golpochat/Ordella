import { createServerApiClient } from '@/lib/api/server';
import { getCohortInsight, type AnalyticsInsightsParams } from '@/lib/api/admin/analytics-insights';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatMoney, getErrorMessage } from '@/lib/utils';

type CohortInsightPageProps = {
  params: { cohort: string };
  searchParams: AnalyticsInsightsParams;
};

export default async function CohortInsightPage({ params, searchParams }: CohortInsightPageProps) {
  const cohort = decodeURIComponent(params.cohort);
  let insight: Awaited<ReturnType<typeof getCohortInsight>> | null = null;
  let error: string | null = null;
  try {
    insight = await getCohortInsight(createServerApiClient(), cohort, searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${cohort} cohort performance`}
        description="Retention, revenue, and order frequency by cohort month."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <Card>
          <CardHeader>
            <CardTitle>Cohort month breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Orders/customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insight.retention.months.map((month) => {
                  const revenue = insight.revenue?.months.find((row) => row.month === month.month);
                  const frequency = insight.orderFrequency?.months.find((row) => row.month === month.month);
                  return (
                    <TableRow key={month.month}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell>{month.customers ?? 0}</TableCell>
                      <TableCell>{month.retentionRate?.toFixed(1) ?? '0'}%</TableCell>
                      <TableCell>{formatMoney(revenue?.revenue ?? '0.00')}</TableCell>
                      <TableCell>{frequency?.ordersPerCustomer?.toFixed(2) ?? '0.00'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
