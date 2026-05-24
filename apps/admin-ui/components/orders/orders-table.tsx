import Link from 'next/link';
import { labelOrderStatus, labelOrderType, type Order } from '@shared-utils';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatDate, formatMoney } from '@/lib/utils';

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
            <TableCell>{labelOrderType(order.orderType)}</TableCell>
            <TableCell>
              <Badge variant="outline">{labelOrderStatus(order.status)}</Badge>
            </TableCell>
            <TableCell>{formatMoney(order.total)}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${order.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
