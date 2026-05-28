'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, Flex, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createEnterpriseExport } from '@/lib/api/admin/reports';
import { getErrorMessage } from '@/lib/utils';
import {
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterSelect,
  paramsFromForm,
} from '@/components/ui/admin-filter';

const reportTypes = ['dashboard', 'summary', 'sales', 'orders', 'customers', 'inventory', 'delivery', 'supplier', 'promotions', 'tax'] as const;
const channels = ['', 'pos', 'online', 'delivery', 'pickup'] as const;

export function ReportExplorerControls() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reportTypeId = useId();
  const channelId = useId();
    const [loading, setLoading] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = paramsFromForm(event.currentTarget, [
      'reportType',
      'from',
      'to',
      'locationId',
      'categoryId',
      'productId',
      'supplierId',
      'channel',
    ]);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function exportReport(format: 'csv' | 'pdf') {
    setLoading(true);
    try {
      const api = createBrowserApiClient();
      const reportType = (searchParams.get('reportType') ?? 'summary') as typeof reportTypes[number];
      const result = await createEnterpriseExport(api, {
        reportType,
        format,
        locationId: searchParams.get('locationId') ?? undefined,
        parameters: {
          from: searchParams.get('from') ?? undefined,
          to: searchParams.get('to') ?? undefined,
          channel: searchParams.get('channel') ?? undefined,
          locationId: searchParams.get('locationId') ?? undefined,
          categoryId: searchParams.get('categoryId') ?? undefined,
          productId: searchParams.get('productId') ?? undefined,
          supplierId: searchParams.get('supplierId') ?? undefined,
        },
      });
      toastInfo(`Export ${result.status}: ${result.rowCount} rows`);
      if (result.fileUrl) {
        window.location.href = result.fileUrl;
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Stack gap="lg">
          <FilterBar onSubmit={onSubmit}>
            <FilterGroup columns={8}>
              <FilterItem label="Report type" htmlFor={reportTypeId} active={Boolean(searchParams.get('reportType'))}>
                <FilterSelect id={reportTypeId} name="reportType" defaultValue={searchParams.get('reportType') ?? 'dashboard'}>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
              <FilterItem label="From" htmlFor="report-explorer-from" active={Boolean(searchParams.get('from'))}>
                <FilterInput
                  id="report-explorer-from"
                  name="from"
                  type="date"
                  defaultValue={searchParams.get('from') ?? ''}
                />
              </FilterItem>
              <FilterItem label="To" htmlFor="report-explorer-to" active={Boolean(searchParams.get('to'))}>
                <FilterInput
                  id="report-explorer-to"
                  name="to"
                  type="date"
                  defaultValue={searchParams.get('to') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Location" htmlFor="report-location" active={Boolean(searchParams.get('locationId'))}>
                <FilterInput
                  id="report-location"
                  name="locationId"
                  placeholder="Location UUID"
                  defaultValue={searchParams.get('locationId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Category" htmlFor="report-category" active={Boolean(searchParams.get('categoryId'))}>
                <FilterInput
                  id="report-category"
                  name="categoryId"
                  placeholder="Category UUID"
                  defaultValue={searchParams.get('categoryId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Product" htmlFor="report-product" active={Boolean(searchParams.get('productId'))}>
                <FilterInput
                  id="report-product"
                  name="productId"
                  placeholder="Product UUID"
                  defaultValue={searchParams.get('productId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Supplier" htmlFor="report-supplier" active={Boolean(searchParams.get('supplierId'))}>
                <FilterInput
                  id="report-supplier"
                  name="supplierId"
                  placeholder="Supplier UUID"
                  defaultValue={searchParams.get('supplierId') ?? ''}
                />
              </FilterItem>
              <FilterItem label="Channel" htmlFor={channelId} active={Boolean(searchParams.get('channel'))}>
                <FilterSelect id={channelId} name="channel" defaultValue={searchParams.get('channel') ?? ''}>
                  {channels.map((channel) => (
                    <option key={channel || 'all'} value={channel}>
                      {channel || 'All channels'}
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
            </FilterGroup>
            <FilterActions>
              <FilterApplyButton>Apply</FilterApplyButton>
            </FilterActions>
          </FilterBar>

          <Flex gap="sm" wrap align="center">
            <Button type="button" variant="outline" isLoading={loading} loadingLabel="Exporting…" onClick={() => void exportReport('csv')}>
              Export CSV
            </Button>
            <Button type="button" variant="outline" isLoading={loading} loadingLabel="Exporting…" onClick={() => void exportReport('pdf')}>
              Export PDF
            </Button>
            </Flex>
        </Stack>
      </CardContent>
    </Card>
  );
}
