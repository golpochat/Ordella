'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@shared-ui';
import { ProductDetail } from '@/components/product-detail';
import { fetchPublicMenu, type OnlineProduct } from '@/lib/api';
import { productJsonLd } from '@/lib/metadata';

type ProductPageProps = {
  params: { id: string };
};

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<OnlineProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicMenu()
      .then((menu) => {
        const match = menu.products.find((p) => p.id === params.id);
        if (!match) {
          setError('Item not found');
          return;
        }
        setProduct(match);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load item'));
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productJsonLd(product));
    script.id = 'product-jsonld';
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [product]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/catalog">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  if (!product) {
    return <p className="p-6 text-muted-foreground">Loading item…</p>;
  }

  return <ProductDetail product={product} />;
}
