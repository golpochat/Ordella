import Link from 'next/link';
import { Eye } from 'lucide-react';
import { labelOrderType, type Order } from '@shared-utils';
import { IconButton } from '@shared-ui';
import { OrderStatusTag } from '@/components/ui/admin-tag';
import { formatDate, formatMoney } from '@/lib/utils';
import {
  AdminTableShell,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <AdminTableShell
      isEmpty={orders.length === 0}
      emptyTitle="No orders"
      emptyDescription="Orders matching your filters will appear here."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right tabular-nums">Total</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
              <TableCell>{labelOrderType(order.orderType)}</TableCell>
              <TableCell>
                <OrderStatusTag status={order.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(order.total)}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <IconButton size="sm" aria-label={`View order ${order.orderNumber ?? order.id.slice(0, 8)}`} asChild>
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </IconButton>
                </TableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
