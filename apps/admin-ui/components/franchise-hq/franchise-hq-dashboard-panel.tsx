import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
import type { HqCategory, HqCustomer, HqOverview } from '@/lib/api/admin/franchise-hq';

type FranchiseHqDashboardPanelProps = {
  overview: HqOverview;
  categories: HqCategory[];
  customers: HqCustomer[];
};

function KpiCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function FranchiseHqDashboardPanel({
  overview,
  categories,
  customers,
}: FranchiseHqDashboardPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total revenue" value={formatMoney(overview.totalRevenue)} />
        <KpiCard title="Total orders" value={overview.totalOrders.toLocaleString()} />
        <KpiCard title="Total customers" value={overview.totalCustomers.toLocaleString()} />
        <KpiCard title="Active locations" value={overview.activeLocations.toLocaleString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average order value</p>
            <p className="mt-2 text-xl font-semibold">{formatMoney(overview.averageOrderValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Low-stock alerts</p>
            <p className="mt-2 text-xl font-semibold">{overview.alerts.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Out-of-stock alerts</p>
            <p className="mt-2 text-xl font-semibold">{overview.alerts.outOfStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failed payments</p>
            <p className="mt-2 text-xl font-semibold">{overview.alerts.failedPayments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LocationTable title="Top-performing locations" locations={overview.topPerformingLocations} />
        <LocationTable title="Underperforming locations" locations={overview.underperformingLocations} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category performance by location</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.slice(0, 8).map((row) => (
                  <TableRow key={`${row.locationId}-${row.categoryId ?? 'none'}`}>
                    <TableCell>{row.locationName}</TableCell>
                    <TableCell>{row.categoryName}</TableCell>
                    <TableCell>{row.quantitySold}</TableCell>
                    <TableCell className="text-right">{formatMoney(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer value by franchisee</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchisee</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead className="text-right">Lifetime value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.slice(0, 8).map((row) => (
                  <TableRow key={row.tenantId}>
                    <TableCell>{row.tenantName}</TableCell>
                    <TableCell>{row.customers}</TableCell>
                    <TableCell className="text-right">{formatMoney(row.lifetimeValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LocationTable({ title, locations }: { title: string; locations: HqOverview['topPerformingLocations'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.locationId}>
                <TableCell>
                  <div>
                    <p className="font-medium">{location.locationName}</p>
                    <p className="text-xs text-muted-foreground">{location.tenantName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{location.status}</Badge>
                </TableCell>
                <TableCell>{location.orders}</TableCell>
                <TableCell className="text-right">{formatMoney(location.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
