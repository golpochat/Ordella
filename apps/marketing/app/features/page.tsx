import Link from 'next/link';
import { Button } from '@shared-ui';
import { CtaButton } from '@/components/cta-button';
import { ScreenshotPlaceholder } from '@/components/screenshot-placeholder';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { featureModules } from '@/lib/features-data';

export const metadata = createMetadata({
  title: 'Features',
  description:
    'POS, online ordering, KDS, delivery, customer app, admin, branding, and Stripe billing for restaurants.',
  path: '/features',
});

export default function FeaturesPage() {
  return (
    <>
      <Section className="pt-12">
        <h1 className="text-4xl font-bold tracking-tight">Everything you need to run a modern restaurant</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          One platform for in-store, online, kitchen, delivery, and guest experiences—with your brand on every
          screen.
        </p>
        <div className="mt-6 flex gap-3">
          <CtaButton utmContent="features_hero">Start free trial</CtaButton>
          <Button asChild variant="outline">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </Section>

      {featureModules.map((mod, index) => (
        <Section
          key={mod.id}
          id={mod.id}
          variant={index % 2 === 1 ? 'muted' : 'default'}
          title={mod.title}
          subtitle={mod.headline}
        >
          <div className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <ul className="space-y-3">
                {mod.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-muted-foreground">
                    <span className="text-brand" aria-hidden>
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Button asChild variant="link" className="mt-4 px-0">
                <Link href={mod.docPath}>Read the guide →</Link>
              </Button>
            </div>
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <ScreenshotPlaceholder label={mod.screenshotLabel} aspect="video" />
            </div>
          </div>
        </Section>
      ))}

      <Section variant="brand" title="Why not patch together five tools?">
        <ul className="max-w-2xl space-y-2 text-brand-foreground/95">
          <li>• One menu and one order pipeline across POS and online</li>
          <li>• Per-tenant branding and domains—not generic marketplace pages</li>
          <li>• Role-based access for admin, staff, drivers, and customers</li>
          <li>• SaaS billing aligned to locations and order volume</li>
        </ul>
        <div className="mt-8">
          <CtaButton utmContent="features_footer" className="bg-background text-foreground hover:bg-background/90">
            Start free trial
          </CtaButton>
        </div>
      </Section>
    </>
  );
}
