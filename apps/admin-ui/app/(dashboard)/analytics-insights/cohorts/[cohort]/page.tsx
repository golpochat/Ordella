import { createServerApiClient } from '@/lib/api/server';
import { getCohortInsight, type AnalyticsInsightsParams } from '@/lib/api/admin/analytics-insights';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { DetailPage, DetailPageHeader, DetailSectionCard } from '@/components/ui/admin-detail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
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
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Analytics insights', href: '/analytics-insights' },
          { label: cohort },
        ]}
        title={`${cohort} cohort performance`}
        description="Retention, revenue, and order frequency by cohort month."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <DetailSectionCard title="Cohort month breakdown" description="Monthly retention and revenue metrics.">
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Orders/customer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {insight.retention.months.map((month) => {
                const revenue = insight.revenue?.months.find((row) => row.month === month.month);
                const frequency = insight.orderFrequency?.months.find((row) => row.month === month.month);
                return (
                  <TableRow key={month.month}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell className="tabular-nums">{month.customers ?? '—'}</TableCell>
                    <TableCell className="tabular-nums">
                      {month.retentionRate != null ? `${(month.retentionRate * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(revenue?.revenue ?? month.revenue ?? '0')}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {frequency?.ordersPerCustomer?.toFixed(2) ?? month.ordersPerCustomer?.toFixed(2) ?? '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DetailSectionCard>
      ) : null}
    </DetailPage>
  );
}
