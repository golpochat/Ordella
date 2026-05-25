import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
import type { HqInventoryItem, HqLocation, HqOrder, HqStaffMember } from '@/lib/api/admin/franchise-hq';

export function FranchiseLocationsTable({ locations }: { locations: HqLocation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>AOV</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.locationId}>
                <TableCell>
                  <p className="font-medium">{location.locationName}</p>
                  <p className="text-xs text-muted-foreground">{location.tenantName}</p>
                </TableCell>
                <TableCell><Badge variant="secondary">{location.status}</Badge></TableCell>
                <TableCell>{location.orders}</TableCell>
                <TableCell>{formatMoney(location.averageOrderValue)}</TableCell>
                <TableCell className="text-right">{formatMoney(location.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function FranchiseOrdersTable({ orders }: { orders: HqOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders across locations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium">{order.orderNumber ?? order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </TableCell>
                <TableCell>
                  <p>{order.locationName}</p>
                  <p className="text-xs text-muted-foreground">{order.tenantName}</p>
                </TableCell>
                <TableCell>{order.orderType}</TableCell>
                <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                <TableCell className="text-right">{formatMoney(order.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function FranchiseInventoryTable({ items }: { items: HqInventoryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory issues across locations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reorder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">SKU {item.sku}</p>
                </TableCell>
                <TableCell>
                  <p>{item.locationName}</p>
                  <p className="text-xs text-muted-foreground">{item.tenantName}</p>
                </TableCell>
                <TableCell><Badge variant={item.status === 'out_of_stock' ? 'destructive' : 'secondary'}>{item.status}</Badge></TableCell>
                <TableCell>{item.quantityAvailable}</TableCell>
                <TableCell>{item.reorderLevel ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function FranchiseStaffTable({ staff }: { staff: HqStaffMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff by franchisee</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell><Badge variant="secondary">{member.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
