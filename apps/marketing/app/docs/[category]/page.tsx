import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocsSidebar } from '@/components/docs-sidebar';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { docCategories } from '@/lib/docs-nav';

type Props = { params: { category: string } };

export function generateStaticParams() {
  return docCategories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: Props) {
  const cat = docCategories.find((c) => c.slug === params.category);
  if (!cat) return {};
  return createMetadata({
    title: `${cat.title} · Docs`,
    description: `Ordella documentation — ${cat.title}`,
    path: `/docs/${params.category}`,
  });
}

export default function DocsCategoryPage({ params }: Props) {
  const cat = docCategories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  return (
    <Section className="pt-10">
      <div className="flex flex-col gap-10 md:flex-row">
        <DocsSidebar activeCategory={cat.slug} />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{cat.title}</h1>
          <ul className="mt-8 space-y-3">
            {cat.articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/docs/${cat.slug}/${a.slug}`}
                  className="text-lg text-primary hover:underline"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
