import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentRoot = path.join(process.cwd(), 'content');

export type DocContent = {
  category: string;
  slug: string;
  title: string;
  description: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  body: string;
};

function readMdFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, content };
}

export function getAllDocPaths(): { category: string; slug: string }[] {
  const docsDir = path.join(contentRoot, 'docs');
  if (!fs.existsSync(docsDir)) return [];

  const paths: { category: string; slug: string }[] = [];
  for (const category of fs.readdirSync(docsDir)) {
    const catDir = path.join(docsDir, category);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const file of fs.readdirSync(catDir)) {
      if (file.endsWith('.md')) {
        paths.push({ category, slug: file.replace(/\.md$/, '') });
      }
    }
  }
  return paths;
}

export function getDoc(category: string, slug: string): DocContent | null {
  const filePath = path.join(contentRoot, 'docs', category, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content } = readMdFile(filePath);
  return {
    category,
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    body: content,
  };
}

export function getAllBlogSlugs(): string[] {
  const blogDir = path.join(contentRoot, 'blog');
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(contentRoot, 'blog', `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const { data, content } = readMdFile(filePath);
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date ?? ''),
    tags: (data.tags as string[]) ?? [],
    body: content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  return getAllBlogSlugs()
    .map((slug) => getBlogPost(slug))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
