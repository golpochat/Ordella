'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useId, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Stack } from '@shared-ui';
import { PanelEmpty } from '@/components/ui/admin-empty-state';
import {
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterCheckboxItem,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterSelect,
  FilterSwitchItem,
} from '@/components/ui/admin-filter';
import { SearchInput } from '@/components/ui/admin-search';
import { createBrowserApiClient } from '@/lib/api/browser';
import { Search } from 'lucide-react';
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
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const queryId = useId();
  const entityId = useId();
  const dateRangeId = useId();
  const inStockId = useId();
  const semanticId = useId();

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
    const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);
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
      toastInfo(`${response.total} result(s)`);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function rebuild() {
    setLoading(true);
    try {
      await reindexSearch(api, entityType);
      toastSuccess('Search index rebuild started for current scope.');
      await runSearch();
    } catch (err) {
      toastError(getErrorMessage(err));
      setLoading(false);
    }
  }

  function clearFilters() {
    setQuery('');
    setEntityType('');
    setLocationId('');
    setCategoryId('');
    setSupplierId('');
    setPriceMin('');
    setPriceMax('');
    setDateRange('');
    setInStockOnly(false);
    setSemantic(false);
    setResults([]);
    }

  const hasActiveFilters =
    Boolean(query.trim()) ||
    Boolean(entityType) ||
    Boolean(locationId) ||
    Boolean(categoryId) ||
    Boolean(supplierId) ||
    Boolean(priceMin) ||
    Boolean(priceMax) ||
    Boolean(dateRange) ||
    inStockOnly ||
    semantic;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Search</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="lg">
          <FilterBar
            onSubmit={(event) => {

              event.preventDefault();
              void runSearch();
            }}
          >
            <FilterGroup columns={4}>
              <FilterItem label="Query" htmlFor={queryId} active={Boolean(query.trim())} className="min-[481px]:max-w-none min-[769px]:col-span-2">
                <SearchInput
                  id={queryId}
                  placeholder="Search products, orders, customers, suppliers, bins…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onClear={() => setQuery('')}
                  onSearch={() => void runSearch()}
                  active={Boolean(query.trim())}
                  aria-label="Search query"
                />
              </FilterItem>
              <FilterItem label="Entity type" htmlFor={entityId} active={Boolean(entityType)}>
                <FilterSelect
                  id={entityId}
                  value={entityType}
                  onChange={(event) => setEntityType(event.target.value)}
                >
                  {ENTITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
              </FilterItem>
              <FilterItem label="Date range" htmlFor={dateRangeId} active={Boolean(dateRange)}>
                <FilterSelect
                  id={dateRangeId}
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                >
                  <option value="">Any date</option>
                  <option value="last_week">Last week</option>
                </FilterSelect>
              </FilterItem>
            </FilterGroup>

            <FilterGroup columns={6}>
              <FilterItem label="Location ID" htmlFor="search-location" active={Boolean(locationId)}>
                <FilterInput
                  id="search-location"
                  placeholder="Location ID"
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                />
              </FilterItem>
              <FilterItem label="Category ID" htmlFor="search-category" active={Boolean(categoryId)}>
                <FilterInput
                  id="search-category"
                  placeholder="Category ID"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                />
              </FilterItem>
              <FilterItem label="Supplier ID" htmlFor="search-supplier" active={Boolean(supplierId)}>
                <FilterInput
                  id="search-supplier"
                  placeholder="Supplier ID"
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                />
              </FilterItem>
              <FilterItem label="Min price" htmlFor="search-price-min" active={Boolean(priceMin)}>
                <FilterInput
                  id="search-price-min"
                  type="number"
                  min={0}
                  placeholder="Min price"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                />
              </FilterItem>
              <FilterItem label="Max price" htmlFor="search-price-max" active={Boolean(priceMax)}>
                <FilterInput
                  id="search-price-max"
                  type="number"
                  min={0}
                  placeholder="Max price"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                />
              </FilterItem>
              <FilterCheckboxItem
                id={inStockId}
                label="In stock only"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
              />
            </FilterGroup>

            <FilterSwitchItem
              id={semanticId}
              label="AI semantic search"
              checked={semantic}
              onChange={(event) => setSemantic(event.target.checked)}
            />

            <FilterActions>
              <FilterApplyButton type="button" isLoading={loading} loadingLabel="Searching…" onClick={() => void runSearch()}>
                Search
              </FilterApplyButton>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void rebuild()}>
                Reindex
              </Button>
              {hasActiveFilters ? (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              ) : null}
            </FilterActions>
          </FilterBar>

          {results.length === 0 && query.trim() ? (
            <PanelEmpty
              title="No matching results"
              description="Try different keywords, filters, or turn on semantic search."
              icon={Search}
            />
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => (
              <div key={`${result.entityType}-${result.entityId}`} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{result.title}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {result.entityType}
                  </span>
                </div>
                {result.body ? <p className="mt-1 line-clamp-2 text-muted-foreground">{result.body}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">{result.entityId}</p>
              </div>
            ))}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
