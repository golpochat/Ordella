import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getReadingTimeMinutes } from './reading-time';

const blogDir = path.join(process.cwd(), 'content', 'blog');

export type BlogFrontmatter = {
  title: string;
  description: string;
  slug: string;
  date: string;
  tags: string[];
  featured?: boolean;
};

export type BlogPostMeta = BlogFrontmatter & {
  readingTimeMinutes: number;
};

function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? '');
}

function parseBlogFile(fileName: string, raw: string): BlogPostMeta | null {
  const { data, content } = matter(raw);
  const fileSlug = fileName.replace(/\.mdx$/, '');
  const slug = (data.slug as string) ?? fileSlug;

  if (!slug) return null;

  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    date: normalizeDate(data.date),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    featured: Boolean(data.featured),
    readingTimeMinutes: getReadingTimeMinutes(content),
  };
}

function readBlogRaw(fileName: string): string | null {
  const filePath = path.join(blogDir, fileName);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function listBlogFileNames(): string[] {
  if (!fs.existsSync(blogDir)) return [];
  return fs.readdirSync(blogDir).filter((file) => file.endsWith('.mdx'));
}

export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((post) => post.slug);
}

export function getAllBlogPosts(): BlogPostMeta[] {
  return listBlogFileNames()
    .map((fileName) => {
      const raw = readBlogRaw(fileName);
      if (!raw) return null;
      return parseBlogFile(fileName, raw);
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getBlogPostMeta(slug: string): BlogPostMeta | null {
  return getAllBlogPosts().find((post) => post.slug === slug) ?? null;
}

export function getBlogPostSource(slug: string): { meta: BlogPostMeta; source: string } | null {
  for (const fileName of listBlogFileNames()) {
    const raw = readBlogRaw(fileName);
    if (!raw) continue;

    const meta = parseBlogFile(fileName, raw);
    if (!meta || meta.slug !== slug) continue;

    return { meta, source: raw };
  }
  return null;
}

export function getAdjacentBlogPosts(slug: string): {
  newer: BlogPostMeta | null;
  older: BlogPostMeta | null;
} {
  const posts = getAllBlogPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };

  return {
    newer: index > 0 ? posts[index - 1]! : null,
    older: index < posts.length - 1 ? posts[index + 1]! : null,
  };
}

export function getFeaturedBlogPosts(): BlogPostMeta[] {
  return getAllBlogPosts().filter((post) => post.featured);
}
