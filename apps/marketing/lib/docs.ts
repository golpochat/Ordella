import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  DOC_CATEGORIES,
  type DocCategoryId,
  getCategoryTitle,
  isDocCategoryId,
} from './docs-categories';

const docsDir = path.join(process.cwd(), 'content', 'docs');

export const DEFAULT_DOC_SLUG = 'getting-started';

export type DocFrontmatter = {
  title: string;
  description: string;
  category: DocCategoryId;
  order: number;
};

export type DocMeta = DocFrontmatter & {
  slug: string;
};

export type DocNavigationGroup = {
  id: DocCategoryId;
  title: string;
  order: number;
  docs: DocMeta[];
};

function parseDocFile(slug: string, raw: string): DocMeta | null {
  const { data, content } = matter(raw);
  const category = data.category as string;

  if (!isDocCategoryId(category)) {
    console.warn(`[docs] Invalid category "${category}" in ${slug}.mdx`);
    return null;
  }

  if (!content.trim()) {
    console.warn(`[docs] Empty body in ${slug}.mdx`);
  }

  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    category,
    order: typeof data.order === 'number' ? data.order : 0,
  };
}

function readDocSource(slug: string): string | null {
  const mdxPath = path.join(docsDir, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) {
    return fs.readFileSync(mdxPath, 'utf8');
  }
  return null;
}

export function getAllDocSlugs(): string[] {
  if (!fs.existsSync(docsDir)) return [];

  return fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function getDocMeta(slug: string): DocMeta | null {
  const source = readDocSource(slug);
  if (!source) return null;
  return parseDocFile(slug, source);
}

export function getAllDocs(): DocMeta[] {
  return getAllDocSlugs()
    .map((slug) => getDocMeta(slug))
    .filter((doc): doc is DocMeta => doc !== null)
    .sort((a, b) => {
      const catOrderA = DOC_CATEGORIES.findIndex((c) => c.id === a.category);
      const catOrderB = DOC_CATEGORIES.findIndex((c) => c.id === b.category);
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      return a.order - b.order;
    });
}

export function getDocSource(slug: string): { meta: DocMeta; source: string } | null {
  const raw = readDocSource(slug);
  if (!raw) return null;

  const meta = parseDocFile(slug, raw);
  if (!meta) return null;

  return { meta, source: raw };
}

export function getDocsNavigation(): DocNavigationGroup[] {
  const allDocs = getAllDocs();

  return DOC_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    order: category.order,
    docs: allDocs
      .filter((doc) => doc.category === category.id)
      .sort((a, b) => a.order - b.order),
  })).filter((group) => group.docs.length > 0);
}

export function getCategoryLabel(categoryId: DocCategoryId): string {
  return getCategoryTitle(categoryId);
}
