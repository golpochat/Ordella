import { createServerApiClient } from '@/lib/api/server';
import { getCustomerInsight } from '@/lib/api/admin/analytics-insights';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
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
    <div className="space-y-6">
      <PageHeader
        title={insight ? `${insight.customer.name} behavior insights` : 'Customer behavior insights'}
        description="Customer-level LTV, churn trend, segments, and recent behavior."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Lifetime value" value={formatMoney(insight.customer.lifetimeValue)} />
            <Metric label="Orders" value={insight.customer.totalOrders} />
            <Metric label="Segments" value={insight.customer.segments.length} />
            <Metric label="Latest churn risk" value={insight.churnTrend[0]?.riskScore ?? 0} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>LTV trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Actual LTV</TableHead>
                      <TableHead>Predicted LTV</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insight.ltvTrend.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{formatMoney(row.lifetimeValue)}</TableCell>
                        <TableCell>{formatMoney(row.predictedLtv)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Churn trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Risk score</TableHead>
                      <TableHead>Band</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {insight.churnTrend.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.riskScore.toFixed(0)}</TableCell>
                        <TableCell>{row.riskBand}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insight.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{formatMoney(order.total)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
