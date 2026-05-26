'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createEnterpriseExport } from '@/lib/api/admin/reports';
import { getErrorMessage } from '@/lib/utils';

const reportTypes = ['dashboard', 'summary', 'sales', 'orders', 'customers', 'inventory', 'delivery', 'supplier', 'promotions', 'tax'] as const;
const channels = ['', 'pos', 'online', 'delivery', 'pickup'] as const;

export function ReportExplorerControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ['reportType', 'from', 'to', 'locationId', 'categoryId', 'productId', 'supplierId', 'channel']) {
      const value = String(formData.get(key) ?? '').trim();
      if (value) params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  async function exportReport(format: 'csv' | 'pdf') {
    setLoading(true);
    setError(null);
    setMessage(null);
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
      setMessage(`Export ${result.status}: ${result.rowCount} rows`);
      if (result.fileUrl) {
        window.location.href = result.fileUrl;
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border bg-card p-4">
      <form className="grid gap-3 md:grid-cols-4 xl:grid-cols-8" onSubmit={onSubmit}>
        <select
          name="reportType"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={searchParams.get('reportType') ?? 'dashboard'}
        >
          {reportTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <Input name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
        <Input name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
        <Input name="locationId" placeholder="Location UUID" defaultValue={searchParams.get('locationId') ?? ''} />
        <Input name="categoryId" placeholder="Category UUID" defaultValue={searchParams.get('categoryId') ?? ''} />
        <Input name="productId" placeholder="Product UUID" defaultValue={searchParams.get('productId') ?? ''} />
        <Input name="supplierId" placeholder="Supplier UUID" defaultValue={searchParams.get('supplierId') ?? ''} />
        <select
          name="channel"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={searchParams.get('channel') ?? ''}
        >
          {channels.map((channel) => (
            <option key={channel || 'all'} value={channel}>
              {channel || 'all channels'}
            </option>
          ))}
        </select>
        <Button type="submit">Apply</Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={() => void exportReport('csv')} disabled={loading}>
          Export CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => void exportReport('pdf')} disabled={loading}>
          Export PDF
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
