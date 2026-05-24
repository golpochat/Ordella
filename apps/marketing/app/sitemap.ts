import type { MetadataRoute } from 'next';
import { getAllBlogSlugs } from '@/lib/blog';
import { getAllDocSlugs } from '@/lib/docs';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const staticRoutes = ['', '/pricing', '/features', '/docs', '/blog', '/contact', '/legal/privacy', '/legal/terms'].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }),
  );

  const docRoutes = getAllDocSlugs().map((slug) => ({
    url: `${base}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: slug === 'getting-started' ? 0.7 : 0.6,
  }));

  const blogRoutes = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...docRoutes, ...blogRoutes];
}
