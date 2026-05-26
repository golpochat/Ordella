'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { labelOrderStatus, labelOrderType } from '@shared-utils';
import { fetchCustomerOrders, type CustomerOrder } from '@/lib/api';
import { isActiveOrderStatus } from '@/lib/order-timeline';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

type OrdersFilter = 'active' | 'past';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default';
  if (status === 'cancelled' || status === 'failed') return 'destructive';
  if (['picking', 'picked', 'preparing', 'ready', 'handed_to_driver', 'out_for_delivery'].includes(status)) {
    return 'secondary';
  }
  return 'outline';
}

export function OrdersList() {
  const { formatCurrency, formatDateTime } = useTenantSettings();
  const [filter, setFilter] = useState<OrdersFilter>('active');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetchCustomerOrders(filter)
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = orders.filter((order) =>
    filter === 'active' ? isActiveOrderStatus(order.status) : !isActiveOrderStatus(order.status),
  );

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Track active and past orders</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as OrdersFilter)}>
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">
            Active
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4 space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!loading && !error && filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders in this tab.</p>
          ) : null}

          {filtered.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-colors hover:bg-accent/40">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">
                    {order.orderNumber ?? order.id.slice(0, 8)}
                  </CardTitle>
                  <Badge variant={statusVariant(order.status)}>{labelOrderStatus(order.status)}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    {formatCurrency(order.total)} · {labelOrderType(order.orderType)}
                  </p>
                  <p>{formatDateTime(order.createdAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
