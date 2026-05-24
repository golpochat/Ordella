import { notFound } from 'next/navigation';
import { CtaButton } from '@/components/cta-button';
import { DocsSidebar } from '@/components/docs-sidebar';
import { Markdown } from '@/components/markdown';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { getAllDocPaths, getDoc } from '@/lib/content';
import { findDocMeta } from '@/lib/docs-nav';

type Props = { params: { category: string; slug: string } };

export function generateStaticParams() {
  return getAllDocPaths().map((p) => ({ category: p.category, slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const doc = getDoc(params.category, params.slug);
  if (!doc) return {};
  return createMetadata({
    title: `${doc.title} · Docs`,
    description: doc.description,
    path: `/docs/${params.category}/${params.slug}`,
  });
}

export default function DocArticlePage({ params }: Props) {
  const doc = getDoc(params.category, params.slug);
  const { category } = findDocMeta(params.category, params.slug);
  if (!doc || !category) notFound();

  return (
    <Section className="pt-10">
      <div className="flex flex-col gap-10 md:flex-row">
        <DocsSidebar activeCategory={params.category} activeSlug={params.slug} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{category.title}</p>
          <h1 className="mt-1 text-3xl font-bold">{doc.title}</h1>
          <div className="mt-8">
            <Markdown content={doc.body} />
          </div>
          <div className="mt-12 border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">Was this helpful? Start using Ordella today.</p>
            <div className="mt-3">
              <CtaButton utmContent={`docs_${params.category}_${params.slug}`}>Start free trial</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
