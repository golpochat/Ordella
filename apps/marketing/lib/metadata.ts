import type { Metadata } from 'next';
import { siteConfig } from './site';

type PageMeta = {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
};

export type BlogPostMeta = {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  tags?: string[];
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
    applicationName: siteConfig.name,
    manifest: siteConfig.manifestPath,
    alternates: { canonical: path || '/' },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [{ url: image, alt: siteConfig.name }],
    },
  };
}

export function createBlogPostMetadata({
  title,
  description,
  path,
  publishedTime,
  tags = [],
  ogImage,
}: BlogPostMeta): Metadata {
  const fullTitle = `${title} · ${siteConfig.name}`;
  const url = `${siteConfig.url}${path}`;
  const image = ogImage ?? siteConfig.ogImage;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: 'article',
      locale: 'en_US',
      publishedTime,
      tags,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [{ url: image, alt: title }],
    },
  };
}
