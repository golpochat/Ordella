import { notFound } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server';
import { getOrder } from '@/lib/api/admin/orders';
import { PageHeader } from '@/components/ui/page-header';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { OrderDetailActions } from '@/components/orders/order-detail-actions';
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';

type OrderDetailPageProps = {
  params: { orderId: string };
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  try {
    const order = await getOrder(createServerApiClient(), params.orderId);

    return (
      <>
        <PageHeader
          title={`Order ${order.orderNumber ?? order.id.slice(0, 8)}`}
          description={`${order.orderType} · ${order.status}`}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Payment:</span> {order.paymentStatus}
              </p>
              <p>
                <span className="text-muted-foreground">Subtotal:</span> {formatMoney(order.subtotal)}
              </p>
              <p>
                <span className="text-muted-foreground">Tax:</span> {formatMoney(order.tax)}
              </p>
              <p>
                <span className="text-muted-foreground">Total:</span> {formatMoney(order.total)}
              </p>
              <p>
                <span className="text-muted-foreground">Created:</span> {formatDate(order.createdAt)}
              </p>
            </CardContent>
          </Card>
          <OrderDetailActions order={order} />
        </div>
        {order.items && order.items.length > 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatMoney(item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </>
    );
  } catch (err) {
    if (getErrorMessage(err).includes('404')) notFound();
    return (
      <>
        <PageHeader title="Order" />
        <ApiErrorBanner message={getErrorMessage(err)} />
      </>
    );
  }
}
