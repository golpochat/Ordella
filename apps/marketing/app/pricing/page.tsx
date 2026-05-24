import { Suspense } from 'react';
import { ComparisonTable } from '@/components/comparison-table';
import { CtaSection } from '@/components/cta-section';
import { CurrencySwitcher } from '@/components/currency-switcher';
import { Faq } from '@/components/faq';
import { PageHero } from '@/components/page-hero';
import { PricingGrid } from '@/components/pricing-grid';
import { Section } from '@/components/section';
import { resolveCurrency } from '@/lib/currency';
import { createMetadata } from '@/lib/metadata';
import { getComparisonRows, plans, pricingFaqs, type PlanId } from '@/lib/plans';

export const metadata = createMetadata({
  title: 'Pricing',
  description:
    'Ordella plans for single-location pilots to multi-location retail brands. Works for restaurants, cafés, takeaways, grocery, butchers, retail shops, and more.',
  path: '/pricing',
});

const planIds: PlanId[] = ['free', 'starter', 'pro', 'enterprise'];

type PricingPageProps = {
  searchParams?: { currency?: string | string[] };
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const currency = resolveCurrency(searchParams?.currency);
  const comparisonRows = getComparisonRows(currency);

  return (
    <>
      <Section size="sm" className="pt-6 sm:pt-10">
        <PageHero
          eyebrow="Pricing"
          title="Plans that scale with your business"
          description="Start free with one business location. Upgrade when you add channels, locations, or order volume. Works for restaurants, cafés, takeaways, grocery, butchers, retail shops, and more."
        >
          <Suspense fallback={null}>
            <CurrencySwitcher active={currency} />
          </Suspense>
        </PageHero>
      </Section>

      <Section variant="muted">
        <PricingGrid plans={plans} currency={currency} />
      </Section>

      <Section title="Compare plans" subtitle="See what is included at each tier." align="center">
        <ComparisonTable planIds={planIds} rows={comparisonRows} />
      </Section>

      <Section variant="muted" id="faq" size="sm">
        <Faq
          items={pricingFaqs}
          title="Billing FAQ"
          subtitle="Common questions about plans, limits, and upgrades."
        />
      </Section>

      <Section size="sm">
        <CtaSection
          variant="default"
          align="center"
          title="Start your free trial"
          subtitle="Create your tenant in minutes. No credit card required on the Free plan."
          utmCampaign="pricing"
          utmContent="pricing_footer"
          secondaryHref="/contact"
          secondaryLabel="Contact sales"
        />
      </Section>
    </>
  );
}
