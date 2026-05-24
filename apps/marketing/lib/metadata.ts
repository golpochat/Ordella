import type { Metadata } from 'next';
import { siteConfig } from './site';

type PageMeta = {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
};

export function createMetadata({ title, description, path = '', ogImage }: PageMeta): Metadata {
  const fullTitle = title === siteConfig.name ? title : `${title} · ${siteConfig.name}`;
  const desc = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const image = ogImage ?? siteConfig.ogImage;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: path || '/' },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image],
    },
  };
}
