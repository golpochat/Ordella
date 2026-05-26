'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
import type { OnlineMenu, OnlineProduct } from '@/lib/api';
import { isProductOrderable, searchStorefrontItems } from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { useBasketStore } from '@/stores/basket-store';

type SortKey = 'name' | 'price-asc' | 'price-desc';

export function CatalogView({ menu, initialCategoryId }: { menu: OnlineMenu; initialCategoryId?: string }) {
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
    const match = menu.products.find(
      (p) => p.barcode === trimmed || p.sku === trimmed,
    );
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

  const predictions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return menu.products
      .filter((item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [menu.products, search]);

  return (
    <div className="mx-auto max-w-[var(--storefront-container)] px-[var(--theme-spacing)] py-[var(--storefront-section-padding)]">
      <div className="mb-6 rounded-[var(--storefront-radius)] bg-muted/50 p-[var(--storefront-card-padding)]">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Shop the catalog</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Find your next order</h1>
        <p className="mt-2 text-sm text-muted-foreground">Search products, scan a SKU, or browse by category.</p>
      </div>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {searchMessage ? <p className="mb-4 text-sm text-muted-foreground">{searchMessage}</p> : null}

      <div className="mb-6 grid gap-[var(--theme-spacing)] rounded-[var(--storefront-radius)] border bg-card p-[var(--storefront-card-padding)] lg:grid-cols-[1fr_auto_auto_auto_auto_auto]">
        <Input
          className="h-12 rounded-[var(--storefront-radius)] text-base"
          placeholder="Search name, SKU, or scan barcode…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSemanticProductIds(null);
          }}
          onKeyDown={onSearchKeyDown}
        />
        <Input
          className="h-12 rounded-[var(--storefront-radius)] lg:w-28"
          type="number"
          min={0}
          placeholder="Min price"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <Input
          className="h-12 rounded-[var(--storefront-radius)] lg:w-28"
          type="number"
          min={0}
          placeholder="Max price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
        <select
          className="h-12 rounded-[var(--storefront-radius)] border bg-background px-3 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort items"
        >
          <option value="name">Sort: Name</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
        <label className="flex h-12 items-center gap-2 rounded-[var(--storefront-radius)] border px-3 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In stock only
        </label>
        <Button type="button" variant="outline" className="h-12 rounded-[var(--storefront-radius)]" disabled={!search.trim()} onClick={() => void runSemanticSearch()}>
          AI search
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['vegan options', 'breakfast products', 'cheap items under 10', 'best sellers'].map((term) => (
          <Button key={term} type="button" size="sm" variant="outline" className="rounded-[var(--storefront-radius)]" onClick={() => setSearch(term)}>
            {term}
          </Button>
        ))}
        {predictions.map((product) => (
          <Button key={product.id} type="button" size="sm" variant="ghost" className="rounded-[var(--storefront-radius)]" onClick={() => setSearch(product.name)}>
            {product.name}
          </Button>
        ))}
      </div>

      <div className="flex min-h-[50vh] gap-[var(--theme-spacing)]">
        <aside className="hidden w-52 shrink-0 space-y-1 md:block">
          <Button
            type="button"
            variant={categoryId === 'all' ? 'default' : 'ghost'}
            className="h-11 w-full justify-start rounded-[var(--storefront-radius)]"
            onClick={() => setCategoryId('all')}
          >
            All
          </Button>
          {menu.categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={categoryId === category.id ? 'default' : 'ghost'}
              className="h-11 w-full justify-start rounded-[var(--storefront-radius)] text-left"
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            <Button
              type="button"
              size="sm"
              variant={categoryId === 'all' ? 'default' : 'outline'}
              className="rounded-[var(--storefront-radius)]"
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
                className="rounded-[var(--storefront-radius)]"
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-[var(--theme-spacing)] sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <CatalogItemCard key={product.id} product={product} onAdd={addItem} />
            ))}
          </div>
          {products.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No items match your filters.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CatalogItemCard({
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
    <Card className={`overflow-hidden rounded-[var(--storefront-radius)] transition-shadow hover:shadow-md ${!orderable ? 'opacity-80' : ''}`}>
      <CardContent className="space-y-3 p-[var(--storefront-card-padding)]">
        {product.imageUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-[var(--storefront-radius)] bg-muted">
            <img
              src={product.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold leading-tight">{product.name}</p>
            {isBundle ? <Badge>Bundle & Save</Badge> : null}
          </div>
          {product.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          ) : null}
          {product.bundleItems?.length ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Includes {product.bundleItems.map((item) => item.name).filter(Boolean).join(', ')}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary">{formatCurrency(product.price)} <span className="text-xs font-normal text-muted-foreground">tax calculated at checkout</span></span>
          {!orderable ? <Badge variant="secondary">Out of stock</Badge> : null}
        </div>
        <p className="text-xs text-muted-foreground">Eligible delivery orders may be fulfilled by a dark store.</p>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-11 flex-1 rounded-[var(--storefront-radius)]">
            <Link href={isBundle ? `/bundle/${product.id}` : `/product/${product.id}`}>Details</Link>
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-[var(--storefront-radius)]"
            disabled={!orderable}
            onClick={() =>
              hasOptions
                ? (window.location.href = `/product/${product.id}`)
                : onAdd(product)
            }
          >
            {hasOptions ? 'Choose' : 'Add'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
