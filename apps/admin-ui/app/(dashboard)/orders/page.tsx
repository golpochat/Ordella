import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { listOrders } from '@/lib/api/admin/orders';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersFilters } from '@/components/orders/orders-filters';
import { getErrorMessage } from '@/lib/utils';

type OrdersPageProps = {
  searchParams: {
    status?: string;
    channel?: string;
    from?: string;
    to?: string;
  };
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  let orders: Awaited<ReturnType<typeof listOrders>> = [];
  let error: string | null = null;

  try {
    orders = await listOrders(createServerApiClient(), searchParams);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader title="Orders" description="View and manage customer orders" />
      <Suspense fallback={null}>
        <OrdersFilters />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {orders.length === 0 && !error ? (
        <EmptyState title="No orders" description="Orders matching your filters will appear here." />
      ) : (
        <OrdersTable orders={orders} />
      )}
    </>
  );
}
