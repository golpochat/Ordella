import Link from 'next/link';
import { Button } from '@shared-ui';
import { CtaButton } from '@/components/cta-button';
import { FeatureCard } from '@/components/feature-card';
import { PricingCard } from '@/components/pricing-card';
import { ScreenshotPlaceholder } from '@/components/screenshot-placeholder';
import { Section } from '@/components/section';
import { featureGridItems, valuePillars } from '@/lib/features-data';
import { plans, pricingFaqs } from '@/lib/plans';

const steps = [
  {
    step: '1',
    title: 'Create your restaurant',
    copy: 'Sign up, add locations, and build or import your menu.',
    label: 'Onboarding wizard',
  },
  {
    step: '2',
    title: 'Go live on every channel',
    copy: 'Enable POS, publish your storefront, and turn on delivery when ready.',
    label: 'POS + Storefront',
  },
  {
    step: '3',
    title: 'Grow with data & billing',
    copy: 'Track performance, run promotions, and upgrade plans as you scale.',
    label: 'Reports & Billing',
  },
];

export default function HomePage() {
  return (
    <>
      <Section className="pt-12 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-brand">Multi-tenant restaurant platform</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Run every order channel from one platform.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Ordella unifies in-store POS, online ordering, kitchen displays, delivery, and customer
              apps—built for multi-location restaurants with your brand on every screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaButton size="lg" utmContent="hero">
                Start free trial
              </CtaButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Free plan · No credit card · 1 location included</p>
          </div>
          <ScreenshotPlaceholder label="Admin + Storefront + KDS" aspect="video" />
        </div>
      </Section>

      <Section variant="muted" title="Trusted by growing restaurant brands" subtitle="Pilot partners and independents use Ordella to unify channels.">
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
          {['Bella Kitchen', 'Harbor Bistro', 'Urban Plate', 'Field & Fire'].map((name) => (
            <span key={name} className="text-lg font-semibold text-muted-foreground">
              {name}
            </span>
          ))}
        </div>
      </Section>

      <Section title="One platform, every channel" subtitle="Orders flow from guests to kitchen to admin—without switching tools.">
        <ScreenshotPlaceholder label="Architecture — channels to Ordella API" aspect="video" />
      </Section>

      <Section variant="muted" title="Built for how restaurants actually operate">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {valuePillars.map((pillar) => (
            <div key={pillar.id} className="space-y-4">
              <FeatureCard title={pillar.title} description={pillar.description} icon={pillar.icon} />
              <ScreenshotPlaceholder label={pillar.screenshotLabel} aspect="video" className="scale-[0.98]" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Everything in one place" subtitle="Twelve capabilities—no patchwork of vendors.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureGridItems.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
          ))}
        </div>
      </Section>

      <Section variant="muted" title="How it works" subtitle="From signup to first order in hours, not weeks.">
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="space-y-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                {s.step}
              </span>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="text-muted-foreground">{s.copy}</p>
              <ScreenshotPlaceholder label={s.label} aspect="video" />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <CtaButton utmContent="how_it_works">Start free trial</CtaButton>
        </div>
      </Section>

      <Section title="See the product" subtitle="Admin, POS, storefront, KDS, driver, and customer experiences.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Admin', 'POS', 'Storefront', 'KDS', 'Driver', 'Customer'].map((tab) => (
            <ScreenshotPlaceholder key={tab} label={tab} aspect="video" />
          ))}
        </div>
      </Section>

      <Section variant="muted" title="Simple, transparent pricing" subtitle="Start free. Upgrade when you grow.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link href="/pricing" className="text-primary font-medium hover:underline">
            Compare all plans →
          </Link>
        </p>
      </Section>

      <Section title="Questions">
        <dl className="mx-auto max-w-2xl space-y-4">
          {pricingFaqs.slice(0, 4).map((faq) => (
            <div key={faq.q}>
              <dt className="font-medium">{faq.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section variant="brand" title="Ready to unify your restaurant?" subtitle="Join operators who run POS, online ordering, and delivery on Ordella.">
        <div className="flex flex-wrap gap-3">
          <CtaButton size="lg" utmContent="final_cta" className="bg-background text-foreground hover:bg-background/90">
            Start free trial
          </CtaButton>
          <Button asChild size="lg" variant="outline" className="border-brand-foreground/30 bg-transparent text-brand-foreground hover:bg-brand-foreground/10">
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
