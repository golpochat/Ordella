'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import Link from 'next/link';
import { memo, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { refreshCrmInsights, type CrmCustomer, type CrmInsights, type CrmSegmentSummary } from '@/lib/api/admin/crm';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';
import { Metric, MetricGrid } from '@/components/ui/admin-card';
import { PanelEmpty } from '@/components/ui/admin-empty-state';
import {
  FilterActions,
  FilterBar,
  FilterItem,
} from '@/components/ui/admin-filter';
import { SearchInput, useDebouncedSearchValue } from '@/components/ui/admin-search';
import { AdminVirtualTable } from '@/components/ui/admin-virtual-table';

export function CrmDashboardPanel({
  insights,
  customers,
  segments,
}: {
  insights: CrmInsights;
  customers: CrmCustomer[];
  segments: CrmSegmentSummary[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebouncedSearchValue(filter);

  async function refresh() {
    try {
      const result = await refreshCrmInsights(createBrowserApiClient());
      toastInfo(`Updated ${result.updated} customer insight records. Refresh the page to see the latest segments.`);
    } catch (error) {
      toastError(getErrorMessage(error));
    }
  }

  const filteredCustomers = useMemo(() => {
    const term = debouncedFilter.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.phone, ...customer.tags, ...customer.segments].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [customers, debouncedFilter]);

  const customerColumns = useMemo(
    () => [
      {
        id: 'customer',
        header: 'Customer',
        cell: (customer: CrmCustomer) => (
          <>
            <Link className="font-medium underline-offset-4 hover:underline" href={`/crm/${customer.id}`}>
              {customer.name}
            </Link>
            <p className="text-xs text-muted-foreground">{customer.email ?? customer.phone ?? 'No contact'}</p>
          </>
        ),
      },
      {
        id: 'value',
        header: 'Value',
        cell: (customer: CrmCustomer) => formatMoney(customer.lifetimeValue),
      },
      {
        id: 'orders',
        header: 'Orders',
        cell: (customer: CrmCustomer) => customer.totalOrders,
      },
      {
        id: 'last',
        header: 'Last order',
        cell: (customer: CrmCustomer) => formatDate(customer.lastOrderAt ?? undefined),
      },
      {
        id: 'tags',
        header: 'Tags',
        cell: (customer: CrmCustomer) => customer.tags.join(', ') || 'None',
      },
      {
        id: 'segments',
        header: 'Segments',
        cell: (customer: CrmCustomer) => customer.segments.slice(0, 2).join(', ') || 'None',
      },
    ],
    [],
  );

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={6}>
        <Metric title="Total customers" value={insights.totalCustomers} />
        <Metric title="New 30 days" value={insights.newCustomersLast30Days} />
        <Metric title="Returning" value={insights.returningCustomers} />
        <Metric title="Repeat rate" value={`${insights.repeatOrderRate}%`} />
        <Metric title="Average CLV" value={formatMoney(insights.averageLifetimeValue)} />
        <Metric title="Churn risk" value={insights.churnRiskCustomers} />
      </MetricGrid>

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
            <Tag key={segment.name} variant="neutral"><TagLabel>{segment.name}: {segment.customerCount}</TagLabel></Tag>
          ))}
          {!segments.length ? <p className="text-sm text-muted-foreground">Run insight refresh to generate CRM segments.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FilterBar as="div">
            <FilterItem label="Search customers" htmlFor="crm-customer-search" active={Boolean(filter.trim())} className="min-[481px]:max-w-md">
              <SearchInput
                id="crm-customer-search"
                placeholder="Name, email, tags, or segments"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                onClear={() => setFilter('')}
                active={Boolean(filter.trim())}
                aria-label="Search customers"
              />
            </FilterItem>
            <FilterActions>
              <Button type="button" onClick={() => void refresh()}>
                Update insights
              </Button>
            </FilterActions>
          </FilterBar>
          <AdminVirtualTable
            rows={filteredCustomers}
            columns={customerColumns}
            getRowKey={(customer) => customer.id}
            aria-label="Customer directory"
          />
        </CardContent>
      </Card>
    </Stack>
  );
}

const BarList = memo(function BarList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between rounded-md border p-2 text-sm">
          <span>{row.label}</span>
          <Tag variant="outline"><TagLabel>{row.count}</TagLabel></Tag>
        </div>
      ))}
    </div>
  );
});

const CustomerList = memo(function CustomerList({ title, customers }: { title: string; customers: CrmCustomer[] }) {
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
        {!customers.length ? <PanelEmpty title="No customers in this group yet" description="Content will appear here when available." /> : null}
      </CardContent>
    </Card>
  );
});
