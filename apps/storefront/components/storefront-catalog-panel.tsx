'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Flex,
  FormField,
  Grid,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  TextMuted,
  odsCardInteractive,
} from '@shared-ui';
import type { OnlineMenu, OnlineProduct } from '@/lib/api';
import {
  autocompleteStorefrontItems,
  isProductOrderable,
  searchStorefrontItems,
  trackSearchEvent,
  type StorefrontAutocompleteSuggestion,
} from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useBasketStore } from '@/stores/basket-store';

type SortKey = 'name' | 'price-asc' | 'price-desc';

export function StorefrontCatalogPanel({
  menu,
  initialCategoryId,
}: {
  menu: OnlineMenu;
  initialCategoryId?: string;
}) {
  const searchParams = useSearchParams();
  const initialCategory = initialCategoryId ?? searchParams.get('category') ?? 'all';
  const addItem = useBasketStore((s) => s.addItem);
  const error = useBasketStore((s) => s.error);

  const [categoryId, setCategoryId] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('name');
  const [semanticProductIds, setSemanticProductIds] = useState<string[] | null>(null);
  const [remotePredictions, setRemotePredictions] = useState<StorefrontAutocompleteSuggestion[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const products = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    let list = menu.products.filter((item) => {
      if (item.isActive === false) return false;
      if (categoryId !== 'all' && item.categoryId !== categoryId) return false;
      if (inStockOnly && !isProductOrderable(item)) return false;
      const price = Number.parseFloat(item.price);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      if (semanticProductIds && !semanticProductIds.includes(item.id)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.sku?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false)
      );
    });

    if (semanticProductIds) {
      return [...list].sort((a, b) => semanticProductIds.indexOf(a.id) - semanticProductIds.indexOf(b.id));
    }

    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') {
        return Number.parseFloat(a.price) - Number.parseFloat(b.price);
      }
      if (sort === 'price-desc') {
        return Number.parseFloat(b.price) - Number.parseFloat(a.price);
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [menu.products, categoryId, search, priceMin, priceMax, inStockOnly, semanticProductIds, sort]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setSemanticProductIds(null);
    if (e.key !== 'Enter') return;
    const trimmed = search.trim();
    if (!trimmed) return;
    const match = menu.products.find((p) => p.barcode === trimmed || p.sku === trimmed);
    if (match) {
      if (match.variants.length || match.modifiers.length) {
        window.location.href = `/product/${match.id}`;
      } else if (isProductOrderable(match)) {
        addItem(match);
        setSearch('');
      }
    }
  };

  const runSemanticSearch = async () => {
    const q = search.trim();
    if (!q) return;
    try {
      const result = await searchStorefrontItems({
        q,
        categoryId: categoryId === 'all' ? undefined : categoryId,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        inStockOnly,
        semantic: true,
      });
      setSemanticProductIds(result.results.map((entry) => entry.entityId));
      setSearchMessage(`AI search found ${result.total} product result(s).`);
    } catch {
      setSemanticProductIds(null);
      setSearchMessage('AI search is unavailable, showing local product matches.');
    }
  };

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setRemotePredictions([]);
      return;
    }
    const timeout = window.setTimeout(() => {
      void autocompleteStorefrontItems(q, {
        categoryId: categoryId === 'all' ? undefined : categoryId,
      })
        .then((response) => setRemotePredictions(response.suggestions))
        .catch(() => setRemotePredictions([]));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [categoryId, search]);

  const predictions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    if (remotePredictions.length) {
      return remotePredictions
        .map((suggestion) => menu.products.find((item) => item.id === suggestion.entityId))
        .filter((item): item is OnlineProduct => Boolean(item));
    }
    return menu.products
      .filter((item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [menu.products, remotePredictions, search]);

  return (
    <Stack gap="lg" className="min-w-0">
      <Stack gap="xs">
        <Text variant="muted" className="text-xs font-medium uppercase tracking-wide text-primary">
          Shop the catalog
        </Text>
        <Heading level={2}>Find your next order</Heading>
        <TextMuted>Search products, scan a SKU, or browse by category.</TextMuted>
      </Stack>

      {error ? <Text variant="destructive">{error}</Text> : null}
      {searchMessage ? <Text variant="muted">{searchMessage}</Text> : null}

      <Card>
        <CardContent className="p-4">
          <Stack gap="md">
            <FormField label="Search" htmlFor="catalog-search">
              <Input
                id="catalog-search"
                placeholder="Search name, SKU, or scan barcode…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSemanticProductIds(null);
                }}
                onKeyDown={onSearchKeyDown}
              />
            </FormField>
            <Grid cols={2} gap="sm" className="min-[769px]:grid-cols-4">
              <FormField label="Min price" htmlFor="catalog-price-min">
                <Input
                  id="catalog-price-min"
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </FormField>
              <FormField label="Max price" htmlFor="catalog-price-max">
                <Input
                  id="catalog-price-max"
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </FormField>
              <FormField label="Sort" htmlFor="catalog-sort">
                <Select
                  id="catalog-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort items"
                >
                  <option value="name">Name</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </Select>
              </FormField>
              <FormField label="Availability" htmlFor="catalog-in-stock">
                <label
                  htmlFor="catalog-in-stock"
                  className="flex h-10 items-center gap-2 rounded-md border border-border-default bg-background px-3 text-sm"
                >
                  <input
                    id="catalog-in-stock"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In stock only
                </label>
              </FormField>
            </Grid>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!search.trim()}
              aria-label="Run AI product search"
              onClick={() => void runSemanticSearch()}
            >
              AI search
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Flex gap="sm" wrap>
        {['vegan options', 'breakfast products', 'cheap items under 10', 'best sellers'].map((term) => (
          <Button
            key={term}
            type="button"
            size="sm"
            variant="outline"
            aria-label={`Search for ${term}`}
            onClick={() => setSearch(term)}
          >
            {term}
          </Button>
        ))}
        {predictions.map((product) => (
          <Button
            key={product.id}
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Search for ${product.name}`}
            onClick={() => {
              setSearch(product.name);
              void trackSearchEvent({
                eventType: 'click',
                query: search,
                entityType: 'item',
                entityId: product.id,
              }).catch(() => undefined);
            }}
          >
            {product.name}
          </Button>
        ))}
      </Flex>

      <Flex gap="lg" className="min-h-[50vh] min-w-0 flex-col min-[769px]:flex-row">
        <Stack gap="xs" className="hidden shrink-0 min-[769px]:w-52">
          <Button
            type="button"
            variant={categoryId === 'all' ? 'default' : 'ghost'}
            className="w-full justify-start"
            aria-label="Show all categories"
            onClick={() => setCategoryId('all')}
          >
            All
          </Button>
          {menu.categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={categoryId === category.id ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              aria-label={`Filter by ${category.name}`}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </Stack>

        <Stack gap="md" className="min-w-0 flex-1">
          <Flex gap="sm" className="overflow-x-auto min-[769px]:hidden">
            <Button
              type="button"
              size="sm"
              variant={categoryId === 'all' ? 'default' : 'outline'}
              onClick={() => setCategoryId('all')}
            >
              All
            </Button>
            {menu.categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                size="sm"
                variant={categoryId === category.id ? 'default' : 'outline'}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </Flex>

          <Grid cols={2} gap="md" responsive className="min-[1025px]:grid-cols-3">
            {products.map((product) => (
              <CatalogProductCard key={product.id} product={product} onAdd={addItem} />
            ))}
          </Grid>
          {products.length === 0 ? (
            <Text variant="muted" className="py-8 text-center">
              No items match your filters.
            </Text>
          ) : null}
        </Stack>
      </Flex>
    </Stack>
  );
}

function CatalogProductCard({
  product,
  onAdd,
}: {
  product: OnlineProduct;
  onAdd: (p: OnlineProduct) => void;
}) {
  const { formatCurrency } = useTenantSettings();
  const orderable = isProductOrderable(product);
  const hasOptions = product.variants.length > 0 || product.modifiers.length > 0;
  const isBundle = product.itemType === 'bundle';

  return (
    <Card
      className={`overflow-hidden ${odsCardInteractive} ${!orderable ? 'opacity-80' : ''}`}
      data-ods-elevation="sm"
    >
      <CardContent className="p-4">
        <Stack gap="md">
          {product.imageUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <Stack gap="xs">
            <Flex align="center" gap="sm" wrap>
              <Heading level={3}>{product.name}</Heading>
              {isBundle ? <Badge>Bundle & Save</Badge> : null}
            </Flex>
            {product.description ? (
              <Text variant="muted" className="line-clamp-2">
                {product.description}
              </Text>
            ) : null}
            <TextMuted>{product.sku?.trim() ? `SKU ${product.sku}` : 'SKU —'}</TextMuted>
          </Stack>
          <Flex align="center" justify="between" gap="sm">
            <Text variant="success">{formatCurrency(product.price)}</Text>
            {!orderable ? <Badge variant="secondary">Out of stock</Badge> : null}
          </Flex>
          <Flex gap="sm">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={isBundle ? `/bundle/${product.id}` : `/product/${product.id}`}>Details</Link>
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={!orderable}
              aria-label={hasOptions ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
              onClick={() =>
                hasOptions
                  ? (window.location.href = `/product/${product.id}`)
                  : onAdd(product)
              }
            >
              {hasOptions ? 'Choose' : 'Add'}
            </Button>
          </Flex>
        </Stack>
      </CardContent>
    </Card>
  );
}
