import Link from 'next/link';
import { Button } from '@shared-ui';
import { CtaButton } from '@/components/cta-button';
import { CtaSection } from '@/components/cta-section';
import { Faq } from '@/components/faq';
import { FeatureGrid } from '@/components/feature-grid';
import { HowItWorks } from '@/components/how-it-works';
import { Pillars } from '@/components/pillars';
import { PricingGrid } from '@/components/pricing-grid';
import { ScreenshotFrame } from '@/components/screenshot-frame';
import { ScreenshotGallery } from '@/components/screenshot-gallery';
import { Section } from '@/components/section';
import { DEFAULT_CURRENCY, resolveCurrency } from '@/lib/currency';
import { featureGridItems, valuePillars } from '@/lib/features-data';
import { plans, pricingFaqs } from '@/lib/plans';

const steps = [
  {
    step: '1',
    title: 'Create your restaurant',
    copy: 'Sign up, add locations, and build or import your menu.',
    image: 'admin-products' as const,
    label: 'Onboarding wizard',
  },
  {
    step: '2',
    title: 'Go live on every channel',
    copy: 'Enable POS, publish your storefront, and turn on delivery when ready.',
    image: 'pos-orders' as const,
    label: 'POS + Storefront',
  },
  {
    step: '3',
    title: 'Grow with data & billing',
    copy: 'Track performance, run promotions, and upgrade plans as you scale.',
    image: 'admin-billing' as const,
    label: 'Reports & Billing',
  },
];

const productScreens = [
  { label: 'Admin dashboard', image: 'admin-dashboard' as const },
  { label: 'POS checkout', image: 'pos-orders' as const },
  { label: 'Online storefront', image: 'storefront-menu' as const },
  { label: 'Kitchen display', image: 'kds-kitchen' as const },
  { label: 'Driver app', image: 'driver-delivery' as const },
  { label: 'Customer app', image: 'customer-orders' as const },
];

const trustedBrands = ['Bella Kitchen', 'Harbor Bistro', 'Urban Plate', 'Field & Fire'];

type HomePageProps = {
  searchParams?: { currency?: string | string[] };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const currency = resolveCurrency(searchParams?.currency);
  const pricingHref = currency === DEFAULT_CURRENCY ? '/pricing' : `/pricing?currency=${currency}`;

  return (
    <>
      <Section size="lg" className="pt-6 sm:pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <p className="text-eyebrow">Multi-tenant restaurant platform</p>
            <h1 className="text-display mt-4">Run every order channel from one platform.</h1>
            <p className="text-body-lg mt-5">
              Ordella unifies in-store POS, online ordering, kitchen displays, delivery, and customer
              apps—built for multi-location restaurants with your brand on every screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaButton size="lg" utmCampaign="landing" utmContent="hero">
                Start free trial
              </CtaButton>
              <Button asChild variant="outline" size="lg">
                <Link href={pricingHref}>See pricing</Link>
              </Button>
            </div>
            <p className="text-caption mt-4">Free plan · No credit card · 1 location included</p>
          </div>
          <ScreenshotFrame
            image="admin-dashboard"
            title="Ordella admin and channel overview"
            caption="Admin, storefront, and kitchen—connected in real time"
            priority
          />
        </div>
      </Section>

      <Section variant="muted" size="sm" align="center">
        <p className="text-caption mb-6 sm:mb-8">Trusted by growing restaurant brands</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {trustedBrands.map((name) => (
            <span key={name} className="text-base font-semibold tracking-tight text-slate sm:text-lg">
              {name}
            </span>
          ))}
        </div>
      </Section>

      <Section
        title="One platform, every channel"
        subtitle="Orders flow from guests to kitchen to admin—without switching tools."
        align="center"
      >
        <div className="mx-auto max-w-4xl">
          <ScreenshotFrame
            image="architecture-overview"
            title="Ordella architecture across channels"
            caption="Storefront, POS, KDS, and delivery share one API and one menu"
          />
        </div>
      </Section>

      <Section
        variant="muted"
        title="Built for how restaurants actually operate"
        subtitle="Three pillars that replace a patchwork of vendors."
        align="center"
      >
        <Pillars pillars={valuePillars.slice(0, 3)} />
      </Section>

      <Section
        title="Everything in one place"
        subtitle="Twelve capabilities—no patchwork of vendors."
        align="center"
      >
        <FeatureGrid items={featureGridItems} compact columns={4} />
      </Section>

      <Section
        variant="muted"
        title="How it works"
        subtitle="From signup to first order in hours, not weeks."
        align="center"
      >
        <HowItWorks steps={steps} />
        <div className="mt-12 text-center">
          <CtaButton size="lg" utmCampaign="landing" utmContent="how_it_works">
            Start free trial
          </CtaButton>
        </div>
      </Section>

      <Section
        title="See the product"
        subtitle="Admin, POS, storefront, KDS, driver, and customer experiences."
        align="center"
      >
        <ScreenshotGallery screens={productScreens} />
      </Section>

      <Section
        variant="muted"
        title="Simple, transparent pricing"
        subtitle="Start free. Upgrade when you grow."
        align="center"
      >
        <PricingGrid plans={plans} currency={currency} compareHref={pricingHref} />
      </Section>

      <Section align="center" size="sm">
        <Faq items={pricingFaqs.slice(0, 4)} title="Questions" />
      </Section>

      <Section size="sm">
        <CtaSection
          variant="brand"
          align="center"
          title="Ready to unify your restaurant?"
          subtitle="Join operators who run POS, online ordering, and delivery on Ordella."
          utmCampaign="landing"
          utmContent="final_cta"
        />
      </Section>
    </>
  );
}
