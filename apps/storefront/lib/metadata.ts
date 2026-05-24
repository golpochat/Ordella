import type { Metadata } from 'next';
import { getBrandName, getBusinessAddress } from './config';

const siteUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3005';

export function buildStorefrontMetadata(
  overrides: Metadata & {
    path?: string;
    product?: { name: string; description?: string | null; price: string; imageUrl?: string | null };
  } = {},
): Metadata {
  const brand = getBrandName();
  const title = overrides.title ?? `${brand} — Shop online`;
  const description =
    (typeof overrides.description === 'string' ? overrides.description : undefined) ??
    `Order from ${brand}. Browse our catalog, choose pickup or delivery, and checkout in minutes.`;

  const url = overrides.path ? `${siteUrl}${overrides.path}` : siteUrl;

  const openGraph: Metadata['openGraph'] = {
    title: String(title),
    description,
    url,
    siteName: brand,
    type: overrides.product ? 'website' : 'website',
    locale: 'en_GB',
  };

  if (overrides.product?.imageUrl) {
    openGraph.images = [{ url: overrides.product.imageUrl, alt: overrides.product.name }];
  }

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: String(title),
      description,
    },
    alternates: { canonical: url },
    other: overrides.product
      ? undefined
      : {
          'business:contact_data:street_address': getBusinessAddress(),
        },
    ...overrides,
  };
}

export function productJsonLd(product: {
  name: string;
  description?: string | null;
  price: string;
  sku?: string | null;
  imageUrl?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    image: product.imageUrl ?? undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };
}
