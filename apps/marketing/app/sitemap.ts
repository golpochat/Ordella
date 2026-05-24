import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { getAllBlogSlugs, getAllDocPaths } from '@/lib/content';
import { docCategories } from '@/lib/docs-nav';

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

  const docRoutes = getAllDocPaths().map((p) => ({
    url: `${base}/docs/${p.category}/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const docCategoryRoutes = docCategories.map((c) => ({
    url: `${base}/docs/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const blogRoutes = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...docCategoryRoutes, ...docRoutes, ...blogRoutes];
}
