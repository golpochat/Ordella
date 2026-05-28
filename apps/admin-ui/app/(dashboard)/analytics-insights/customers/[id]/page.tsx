import { createServerApiClient } from '@/lib/api/server';
import { getCustomerInsight } from '@/lib/api/admin/analytics-insights';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import {
  DetailMetric,
  DetailMetrics,
  DetailPage,
  DetailPageHeader,
  DetailSectionCard,
  DetailTwoColumn,
} from '@/components/ui/admin-detail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';

type CustomerInsightPageProps = {
  params: { id: string };
};

export default async function CustomerInsightPage({ params }: CustomerInsightPageProps) {
  let insight: Awaited<ReturnType<typeof getCustomerInsight>> | null = null;
  let error: string | null = null;
  try {
    insight = await getCustomerInsight(createServerApiClient(), params.id);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Analytics insights', href: '/analytics-insights' },
          { label: insight?.customer.name ?? 'Customer insights' },
        ]}
        title={insight ? `${insight.customer.name} behavior insights` : 'Customer behavior insights'}
        description="Customer-level LTV, churn trend, segments, and recent behavior."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <>
          <DetailMetrics>
            <DetailMetric label="Lifetime value" value={formatMoney(insight.customer.lifetimeValue)} />
            <DetailMetric label="Orders" value={insight.customer.totalOrders} />
            <DetailMetric label="Segments" value={insight.customer.segments.length} />
            <DetailMetric label="Latest churn risk" value={insight.churnTrend[0]?.riskScore ?? 0} />
          </DetailMetrics>

          <DetailTwoColumn
            primary={
              <DetailSectionCard title="LTV trend" description="Actual vs predicted lifetime value over time.">
                <Table>
                  <TableHeader sticky>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Actual LTV</TableHead>
                      <TableHead>Predicted LTV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody zebra>
                    {insight.ltvTrend.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="tabular-nums">{formatMoney(row.lifetimeValue)}</TableCell>
                        <TableCell className="tabular-nums">{formatMoney(row.predictedLtv)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DetailSectionCard>
            }
            secondary={
              <DetailSectionCard title="Churn trend" description="Risk score and band by period.">
                <Table>
                  <TableHeader sticky>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Risk score</TableHead>
                      <TableHead>Band</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody zebra>
                    {insight.churnTrend.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="tabular-nums">{row.riskScore.toFixed(0)}</TableCell>
                        <TableCell>{row.riskBand}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DetailSectionCard>
            }
          />

          <DetailSectionCard title="Recent orders" description="Latest transactions for this customer.">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {insight.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="tabular-nums">{formatMoney(order.total)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DetailSectionCard>
        </>
      ) : null}
    </DetailPage>
  );
}
