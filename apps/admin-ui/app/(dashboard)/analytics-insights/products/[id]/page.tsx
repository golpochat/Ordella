import { createServerApiClient } from '@/lib/api/server';
import { getProductInsight } from '@/lib/api/admin/analytics-insights';
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
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Analytics insights', href: '/analytics-insights' },
          { label: insight?.product.name ?? 'Product insights' },
        ]}
        title={insight ? `${insight.product.name} affinity insights` : 'Product affinity insights'}
        description="Product-level basket analysis, affinity scores, confidence, and lift."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {insight ? (
        <DetailSectionCard
          title="Frequently bought together"
          description="Related products ranked by affinity, confidence, and lift."
        >
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Related product</TableHead>
                <TableHead>Affinity score</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Lift</TableHead>
                <TableHead>Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {insight.affinities.map((row) => (
                <TableRow key={row.productId}>
                  <TableCell className="font-medium">{row.productName}</TableCell>
                  <TableCell className="tabular-nums">{row.affinityScore.toFixed(1)}</TableCell>
                  <TableCell className="tabular-nums">{(row.confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell className="tabular-nums">{row.lift.toFixed(2)}</TableCell>
                  <TableCell className="tabular-nums">{row.orderCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailSectionCard>
      ) : null}
    </DetailPage>
  );
}
