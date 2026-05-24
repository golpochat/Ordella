'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import type { OnlineMenu, OnlineProduct } from '@/lib/api';
import { isProductOrderable } from '@/lib/api';
import { useBasketStore } from '@/stores/basket-store';

export function MenuView({ menu }: { menu: OnlineMenu }) {
  const addItem = useBasketStore((s) => s.addItem);
  const syncing = useBasketStore((s) => s.syncing);
  const error = useBasketStore((s) => s.error);

  const [categoryId, setCategoryId] = useState<string>('all');

  const products = useMemo(() => {
    if (categoryId === 'all') return menu.products;
    return menu.products.filter((p) => p.categoryId === categoryId);
  }, [menu.products, categoryId]);

  const onQuickAdd = (product: OnlineProduct) => {
    void addItem(product);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-bold">Menu</h1>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <Tabs value={categoryId} onValueChange={setCategoryId}>
        <TabsList className="mb-6 flex h-auto flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger value="all" className="h-11 px-4 text-base">
            All
          </TabsTrigger>
          {menu.categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="h-11 px-4 text-base">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={categoryId}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const orderable = isProductOrderable(product);
              return (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">${product.price}</span>
                      {!orderable ? <Badge variant="secondary">Out of stock</Badge> : null}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="h-11 flex-1">
                        <Link href={`/product/${product.id}`}>Details</Link>
                      </Button>
                      <Button
                        className="h-11 flex-1"
                        disabled={!orderable || syncing}
                        onClick={() => onQuickAdd(product)}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
