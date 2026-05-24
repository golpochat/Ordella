import { notFound } from 'next/navigation';
import { CtaButton } from '@/components/cta-button';
import { MdxContent } from '@/components/docs/mdx-content';
import { getAllDocSlugs, getCategoryLabel, getDocSource } from '@/lib/docs';
import { createMetadata } from '@/lib/metadata';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props) {
  const doc = getDocSource(params.slug);
  if (!doc) return {};
  return createMetadata({
    title: `${doc.meta.title} · Docs`,
    description: doc.meta.description,
    path: `/docs/${params.slug}`,
  });
}

export default async function DocPage({ params }: Props) {
  const doc = getDocSource(params.slug);
  if (!doc) notFound();

  const { meta, source } = doc;

  return (
    <article>
      <header className="border-b border-border pb-6">
        <p className="text-eyebrow">{getCategoryLabel(meta.category)}</p>
        <h1 className="text-h1 mt-2">{meta.title}</h1>
        {meta.description ? <p className="text-body-lg mt-3 text-slate">{meta.description}</p> : null}
      </header>
      <div className="mt-8 lg:mt-10">
        <MdxContent source={source} />
      </div>
      <aside className="mt-12 rounded-2xl border border-border bg-gray-light p-6 sm:p-8">
        <p className="text-h4">Was this helpful?</p>
        <p className="text-body mt-2">Start using Ordella today.</p>
        <div className="mt-5">
              <CtaButton utmCampaign="docs" utmContent={`docs_${params.slug}`}>
                Start free trial
              </CtaButton>
        </div>
      </aside>
    </article>
  );
}
