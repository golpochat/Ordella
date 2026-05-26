import { createServerApiClient } from '@/lib/api/server';
import { getProductInsight } from '@/lib/api/admin/analytics-insights';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { getErrorMessage } from '@/lib/utils';

type ProductInsightPageProps = {
  params: { id: string };
};

export default async function ProductInsightPage({ params }: ProductInsightPageProps) {
  let insight: Awaited<ReturnType<typeof getProductInsight>> | null = null;
  let error: string | null = null;
  try {
    insight = await getProductInsight(createServerApiClient(), params.id);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={insight ? `${insight.product.name} affinity insights` : 'Product affinity insights'}
        description="Product-level basket analysis, affinity scores, confidence, and lift."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <Card>
          <CardHeader>
            <CardTitle>Frequently bought together</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Related product</TableHead>
                  <TableHead>Affinity score</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Lift</TableHead>
                  <TableHead>Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insight.affinities.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.affinityScore.toFixed(1)}</TableCell>
                    <TableCell>{(row.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>{row.lift.toFixed(2)}</TableCell>
                    <TableCell>{row.orderCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
