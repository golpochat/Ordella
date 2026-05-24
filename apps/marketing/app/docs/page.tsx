import Link from 'next/link';
import { CtaButton } from '@/components/cta-button';
import { DocsSidebar } from '@/components/docs-sidebar';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { docCategories } from '@/lib/docs-nav';

export const metadata = createMetadata({
  title: 'Documentation',
  description: 'Help center for Ordella — getting started, onboarding, admin, POS, storefront, and billing.',
  path: '/docs',
});

export default function DocsHomePage() {
  return (
    <Section className="pt-10">
      <div className="flex flex-col gap-10 md:flex-row">
        <DocsSidebar />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Guides for setting up your restaurant, going live, and running day-to-day operations on Ordella.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {docCategories.map((cat) => (
              <div key={cat.slug} className="rounded-lg border border-border p-5">
                <h2 className="font-semibold">
                  <Link href={`/docs/${cat.slug}`} className="hover:text-primary">
                    {cat.title}
                  </Link>
                </h2>
                <ul className="mt-3 space-y-2">
                  {cat.articles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/docs/${cat.slug}/${a.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-lg border border-dashed border-brand/40 bg-brand-muted/30 p-6">
            <p className="font-medium">Ready to try Ordella?</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your tenant and complete the onboarding wizard.</p>
            <div className="mt-4">
              <CtaButton utmContent="docs_home">Start free trial</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
