import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server';
import { getOrder } from '@/lib/api/admin/orders';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { OrderDetailActions } from '@/components/orders/order-detail-actions';
import {
  DetailField,
  DetailPage,
  DetailPageHeader,
  DetailSectionCard,
  DetailStatusBadge,
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
import { labelOrderStatus, labelOrderType } from '@shared-utils';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';

type OrderDetailPageProps = {
  params: { orderId: string };
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  try {
    const order = await getOrder(createServerApiClient(), params.orderId);

    return (
      <DetailPage>
        <DetailPageHeader
          breadcrumb={[
            { label: 'Orders', href: '/orders' },
            { label: `Order ${order.orderNumber ?? order.id.slice(0, 8)}` },
          ]}
          title={`Order ${order.orderNumber ?? order.id.slice(0, 8)}`}
          description={`${labelOrderType(order.orderType)} · ${labelOrderStatus(order.status)}`}
          actions={<DetailStatusBadge status={order.status} />}
        />

        <DetailTwoColumn
          primary={
            <DetailSectionCard title="Summary" description="Payment and totals for this order.">
              <div className="grid gap-3 min-[481px]:grid-cols-2">
                <DetailField label="Payment status" value={<DetailStatusBadge status={order.paymentStatus} />} />
                <DetailField label="Subtotal" value={formatMoney(order.subtotal)} />
                <DetailField label="Tax" value={formatMoney(order.tax)} />
                <DetailField label="Total" value={formatMoney(order.total)} />
                <DetailField
                  label="Created"
                  value={<span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>}
                  className="min-[481px]:col-span-2"
                />
              </div>
            </DetailSectionCard>
          }
          secondary={<OrderDetailActions order={order} />}
        />

        {order.items && order.items.length > 0 ? (
          <DetailSectionCard title="Line items" description="Products included in this order.">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right tabular-nums">Qty</TableHead>
                  <TableHead className="text-right tabular-nums">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productId}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DetailSectionCard>
        ) : null}
      </DetailPage>
    );
  } catch (err) {
    if (getErrorMessage(err).includes('404')) notFound();
    return (
      <DetailPage>
        <DetailPageHeader
          breadcrumb={[
            { label: 'Orders', href: '/orders' },
            { label: 'Order' },
          ]}
          title="Order"
        />
        <ApiErrorBanner message={getErrorMessage(err)} />
      </DetailPage>
    );
  }
}
