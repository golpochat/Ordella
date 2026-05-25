'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { refreshCrmInsights, type CrmCustomer, type CrmInsights, type CrmSegmentSummary } from '@/lib/api/admin/crm';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';

export function CrmDashboardPanel({
  insights,
  customers,
  segments,
}: {
  insights: CrmInsights;
  customers: CrmCustomer[];
  segments: CrmSegmentSummary[];
}) {
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setMessage(null);
    try {
      const result = await refreshCrmInsights(createBrowserApiClient());
      setMessage(`Updated ${result.updated} customer insight records. Refresh the page to see the latest segments.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const term = filter.trim().toLowerCase();
    if (!term) return true;
    return [customer.name, customer.email, customer.phone, ...customer.tags, ...customer.segments]
      .some((value) => value?.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-6">
        <Metric title="Total customers" value={insights.totalCustomers} />
        <Metric title="New 30 days" value={insights.newCustomersLast30Days} />
        <Metric title="Returning" value={insights.returningCustomers} />
        <Metric title="Repeat rate" value={`${insights.repeatOrderRate}%`} />
        <Metric title="Average CLV" value={formatMoney(insights.averageLifetimeValue)} />
        <Metric title="Churn risk" value={insights.churnRiskCustomers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRM Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <BarList title="Customer growth" rows={insights.customerGrowth.map((row) => ({ label: row.month, count: row.count }))} />
          <BarList title="Value distribution" rows={insights.valueDistribution} />
          <BarList title="Order frequency" rows={insights.orderFrequencyDistribution} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CustomerList title="Top customers" customers={insights.topCustomers} />
        <CustomerList title="At-risk customers" customers={insights.atRiskCustomers} />
        <CustomerList title="High-value customers" customers={insights.highValueCustomers} />
        <CustomerList title="Inactive customers" customers={insights.inactiveCustomers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {segments.map((segment) => (
            <Badge key={segment.name} variant="secondary">{segment.name}: {segment.customerCount}</Badge>
          ))}
          {!segments.length ? <p className="text-sm text-muted-foreground">Run insight refresh to generate CRM segments.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input placeholder="Search customers, tags, or segments" value={filter} onChange={(event) => setFilter(event.target.value)} />
            <Button type="button" onClick={() => void refresh()}>Update insights</Button>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Last order</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Segments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link className="font-medium underline-offset-4 hover:underline" href={`/crm/${customer.id}`}>{customer.name}</Link>
                    <p className="text-xs text-muted-foreground">{customer.email ?? customer.phone ?? 'No contact'}</p>
                  </TableCell>
                  <TableCell>{formatMoney(customer.lifetimeValue)}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderAt ?? undefined)}</TableCell>
                  <TableCell>{customer.tags.join(', ') || 'None'}</TableCell>
                  <TableCell>{customer.segments.slice(0, 2).join(', ') || 'None'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function BarList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between rounded-md border p-2 text-sm">
          <span>{row.label}</span>
          <Badge variant="outline">{row.count}</Badge>
        </div>
      ))}
    </div>
  );
}

function CustomerList({ title, customers }: { title: string; customers: CrmCustomer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {customers.map((customer) => (
          <Link key={customer.id} href={`/crm/${customer.id}`} className="block rounded-md border p-3 hover:bg-muted">
            <span className="block text-sm font-medium">{customer.name}</span>
            <span className="block text-xs text-muted-foreground">
              {formatMoney(customer.lifetimeValue)} · {customer.totalOrders} orders · {formatDate(customer.lastOrderAt ?? undefined)}
            </span>
          </Link>
        ))}
        {!customers.length ? <p className="text-sm text-muted-foreground">No customers in this group yet.</p> : null}
      </CardContent>
    </Card>
  );
}
