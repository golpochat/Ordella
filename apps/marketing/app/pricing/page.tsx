import { PricingCard } from '@/components/pricing-card';
import { Section } from '@/components/section';
import { CtaButton } from '@/components/cta-button';
import { createMetadata } from '@/lib/metadata';
import { comparisonRows, plans, pricingFaqs, type PlanId } from '@/lib/plans';

export const metadata = createMetadata({
  title: 'Pricing',
  description: 'Ordella plans for single-location pilots to multi-location brands. Free, Starter, Pro, and Enterprise.',
  path: '/pricing',
});

function cellValue(value: string | boolean): string {
  if (value === true) return '✓';
  if (value === false) return '—';
  return value;
}

export default function PricingPage() {
  const planIds: PlanId[] = ['free', 'starter', 'pro', 'enterprise'];

  return (
    <>
      <Section className="pt-12">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Start free with one location. Upgrade when you add channels, locations, or order volume.
        </p>
      </Section>

      <Section variant="muted">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </Section>

      <Section title="Compare plans">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 text-left font-medium">Feature</th>
                {planIds.map((id) => (
                  <th key={id} className="px-3 py-3 text-center font-medium capitalize">
                    {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-border/60">
                  <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                  {planIds.map((id) => (
                    <td key={id} className="px-3 py-3 text-center">
                      {cellValue(row.values[id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section variant="muted" title="Billing FAQ" id="faq">
        <dl className="mx-auto max-w-2xl space-y-6">
          {pricingFaqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-semibold">{faq.q}</dt>
              <dd className="mt-2 text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Start your free trial">
        <p className="mb-6 max-w-xl text-muted-foreground">
          Create your tenant in minutes. No credit card required on the Free plan.
        </p>
        <CtaButton size="lg" utmContent="pricing_footer">
          Start free trial
        </CtaButton>
      </Section>
    </>
  );
}
