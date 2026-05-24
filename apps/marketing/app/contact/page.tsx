import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Contact sales',
  description: 'Contact Ordella for Enterprise plans, demos, and partnerships.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <Section className="pt-6 sm:pt-10" size="sm">
      <PageHero
        eyebrow="Contact"
        title="Contact sales"
        description="Enterprise plans, multi-location rollouts, and custom SLAs. Tell us about your operation and we will get back within one business day."
      />
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-brand sm:mt-12 sm:p-8">
        <p className="text-body">Email our sales team:</p>
        <a
          href="mailto:sales@ordella.com"
          className="mt-3 inline-block text-xl font-semibold text-primary hover:underline"
        >
          sales@ordella.com
        </a>
      </div>
    </Section>
  );
}
