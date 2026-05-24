'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '@shared-ui';
import type { OnlineMenu, OnlineProduct } from '@/lib/api';
import { isProductOrderable } from '@/lib/api';
import { getBrandName } from '@/lib/config';
import { useBasketStore } from '@/stores/basket-store';

type StorefrontHomeProps = {
  menu: OnlineMenu;
};

export function StorefrontHome({ menu }: StorefrontHomeProps) {
  const addItem = useBasketStore((s) => s.addItem);

  const featuredCategories = [...menu.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  const featuredItems = menu.products
    .filter((p) => isProductOrderable(p))
    .slice(0, 6);

  return (
    <div>
      <section className="border-b bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Retail ordering</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Shop {getBrandName()} online
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Browse our catalog, customize your items, and choose pickup or delivery. Fast checkout,
            built for every retail business.
          </p>
          <Button asChild className="mt-6 h-12 px-8 text-base">
            <Link href="/catalog">
              Shop now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {featuredCategories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 text-2xl font-semibold">Featured categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Button
                key={category.id}
                asChild
                variant="outline"
                className="h-auto min-h-20 justify-start p-4 text-left text-base"
              >
                <Link href={`/catalog?category=${category.id}`}>{category.name}</Link>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {featuredItems.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured items</h2>
            <Link href="/catalog" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((product) => (
              <FeaturedItemCard
                key={product.id}
                product={product}
                onAdd={() => addItem(product)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function FeaturedItemCard({
  product,
  onAdd,
}: {
  product: OnlineProduct;
  onAdd: () => void;
}) {
  const hasOptions = product.variants.length > 0 || product.modifiers.length > 0;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-muted-foreground">${product.price}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-11 flex-1">
            <Link href={`/product/${product.id}`}>View</Link>
          </Button>
          {hasOptions ? (
            <Button asChild className="h-11 flex-1">
              <Link href={`/product/${product.id}`}>Customize</Link>
            </Button>
          ) : (
            <Button type="button" className="h-11 flex-1" onClick={onAdd}>
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
