import Link from 'next/link';
import { Button } from '@shared-ui';
import { Check } from 'lucide-react';
import { CtaButton } from '@/components/cta-button';
import { FeatureModuleSection } from '@/components/feature-module-section';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';
import { featureModules } from '@/lib/features-data';

export const metadata = createMetadata({
  title: 'Features',
  description:
    'POS, online ordering, fulfillment display, delivery, customer app, admin, branding, and Stripe billing for restaurants, cafés, takeaways, grocery, butchers, and retail businesses.',
  path: '/features',
});

const whyOrdella = [
  'One catalog and one order pipeline across POS and online',
  'Per-tenant branding and domains—not generic marketplace pages',
  'Role-based access for admin, staff, drivers, and customers',
  'SaaS billing aligned to business locations and order volume',
];

export default function FeaturesPage() {
  return (
    <>
      <Section size="sm" className="pt-6 sm:pt-10">
        <PageHero
          eyebrow="Features"
          title="Everything you need to run a modern retail business"
          description="One platform for in-store, online, fulfillment, delivery, and customer experiences—with your brand on every screen."
        >
          <CtaButton utmCampaign="features" utmContent="features_hero">
            Start free trial
          </CtaButton>
          <Button asChild variant="outline">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </PageHero>
      </Section>

      {featureModules.map((mod, index) => (
        <FeatureModuleSection key={mod.id} module={mod} reversed={index % 2 === 1} />
      ))}

      <Section variant="brand" title="Why not patch together five tools?" align="center">
        <ul className="mx-auto max-w-2xl space-y-3 text-left">
          {whyOrdella.map((item) => (
            <li key={item} className="flex gap-3 text-primary-foreground/95">
              <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <CtaButton
            size="lg"
            utmCampaign="features"
            utmContent="features_footer"
            className="bg-background text-navy hover:bg-background/90"
          >
            Start free trial
          </CtaButton>
        </div>
      </Section>
    </>
  );
}
