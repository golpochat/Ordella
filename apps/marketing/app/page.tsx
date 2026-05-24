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
import { SocialProof } from '@/components/social-proof';
import { DEFAULT_CURRENCY, resolveCurrency } from '@/lib/currency';
import { featureGridItems, valuePillars } from '@/lib/features-data';
import { plans, pricingFaqs } from '@/lib/plans';

const steps = [
  {
    step: '1',
    title: 'Create your business',
    copy: 'Sign up, add locations, and build or import your catalog.',
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
  { label: 'Fulfillment display', image: 'kds-kitchen' as const },
  { label: 'Driver app', image: 'driver-delivery' as const },
  { label: 'Customer app', image: 'customer-orders' as const },
];

const trustedBrands = ['Bella Market', 'Harbor Café', 'Urban Grocery', 'Field & Fashion'];

type HomePageProps = {
  searchParams?: { currency?: string | string[] };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const currency = resolveCurrency(searchParams?.currency);
  const pricingHref = currency === DEFAULT_CURRENCY ? '/pricing' : `/pricing?currency=${currency}`;

  return (
    <>
      <Section size="lg" className="pt-6 sm:pt-10 lg:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
          <div className="hero-copy-stack max-w-xl lg:max-w-none">
            <p className="text-eyebrow">Multi-channel retail platform for modern businesses</p>
            <h1 className="text-display">Run every retail order channel from one platform.</h1>
            <p className="text-body-lg">
              Ordella unifies POS, online ordering, inventory, fulfillment, delivery, and customer
              experiences—built for restaurants, cafés, takeaways, grocery, butchers, retail shops, and
              multi-location businesses.
            </p>
            <div className="hero-cta-group">
              <CtaButton size="lg" utmCampaign="landing" utmContent="hero">
                Start free trial
              </CtaButton>
              <Button asChild variant="outline" size="lg" className="w-full xs:w-auto">
                <Link href={pricingHref}>See pricing</Link>
              </Button>
            </div>
            <p className="text-caption">Free plan · No credit card · 1 location included</p>
          </div>
          <div className="w-full lg:justify-self-end">
            <ScreenshotFrame
              image="admin-dashboard"
              title="Ordella admin and channel overview"
              caption="Admin, storefront, and fulfillment—connected in real time"
              priority
            />
          </div>
        </div>
      </Section>

      <Section variant="muted" size="sm" align="center">
        <p className="text-eyebrow mb-4 sm:mb-6">Trusted by growing retail and food businesses</p>
        <SocialProof brands={trustedBrands} />
      </Section>

      <Section
        title="One platform, every channel"
        subtitle="Orders flow from customers to fulfillment to admin—without switching tools."
        align="center"
      >
        <div className="mx-auto w-full max-w-4xl">
          <ScreenshotFrame
            image="architecture-overview"
            title="Ordella architecture across channels"
            caption="Storefront, POS, KDS, and delivery share one API and one catalog"
          />
        </div>
      </Section>

      <Section
        variant="muted"
        title="Built for how retail businesses actually operate"
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
        <div className="mt-10 text-center sm:mt-12">
          <CtaButton size="lg" utmCampaign="landing" utmContent="how_it_works">
            Start free trial
          </CtaButton>
        </div>
      </Section>

      <Section
        title="See the product"
        subtitle="Admin, POS, storefront, fulfillment display, driver, and customer experiences."
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

      <Section size="sm" className="pb-section lg:pb-section-lg">
        <CtaSection
          variant="brand"
          align="center"
          title="Ready to unify your retail channels?"
          subtitle="Join operators who run POS, online ordering, fulfillment, and delivery on Ordella."
          utmCampaign="landing"
          utmContent="final_cta"
        />
      </Section>
    </>
  );
}
