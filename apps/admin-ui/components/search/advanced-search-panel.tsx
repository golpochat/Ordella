'use client';

import { useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { searchIndex, reindexSearch, type AdminSearchResult } from '@/lib/api/admin/search';
import { getErrorMessage } from '@/lib/utils';

const ENTITY_OPTIONS = [
  { value: '', label: 'All entities' },
  { value: 'item', label: 'Items' },
  { value: 'order', label: 'Orders' },
  { value: 'customer', label: 'Customers' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'inventory_item', label: 'Inventory' },
  { value: 'location', label: 'Locations' },
  { value: 'bin', label: 'Warehouse bins' },
];

export function AdvancedSearchPanel() {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [semantic, setSemantic] = useState(false);
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await searchIndex(api, {
        q: query,
        entityType,
        locationId,
        categoryId,
        supplierId,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        inStockOnly,
        dateRange,
        semantic,
        sort: semantic ? 'relevance' : 'relevance',
      });
      setResults(response.results);
      setMessage(`${response.total} result(s)`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function rebuild() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await reindexSearch(api, entityType);
      setMessage('Search index rebuild started for current scope.');
      await runSearch();
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <Input
            className="lg:col-span-2"
            placeholder="Search products, orders, customers, suppliers, bins…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void runSearch();
            }}
          />
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          >
            {ENTITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
          >
            <option value="">Any date</option>
            <option value="last_week">Last week</option>
          </select>
        </div>

        <div className="grid gap-3 lg:grid-cols-6">
          <Input placeholder="Location ID" value={locationId} onChange={(event) => setLocationId(event.target.value)} />
          <Input placeholder="Category ID" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} />
          <Input placeholder="Supplier ID" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} />
          <Input type="number" min={0} placeholder="Min price" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} />
          <Input type="number" min={0} placeholder="Max price" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} />
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />
            In stock
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input type="checkbox" checked={semantic} onChange={(event) => setSemantic(event.target.checked)} />
            AI semantic search
          </label>
          <Button type="button" onClick={() => void runSearch()} disabled={loading}>
            Search
          </Button>
          <Button type="button" variant="outline" onClick={() => void rebuild()} disabled={loading}>
            Reindex
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((result) => (
            <div key={`${result.entityType}-${result.entityId}`} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{result.title}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {result.entityType}
                </span>
              </div>
              {result.body ? <p className="mt-1 line-clamp-2 text-muted-foreground">{result.body}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{result.entityId}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
