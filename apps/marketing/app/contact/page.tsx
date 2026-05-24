import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Contact sales',
  description: 'Contact Ordella for Enterprise plans, demos, and partnerships.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <Section className="pt-12">
      <h1 className="text-4xl font-bold">Contact sales</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Enterprise plans, multi-location rollouts, and custom SLAs. Tell us about your operation and we will
        get back within one business day.
      </p>
      <p className="mt-8">
        <a href="mailto:sales@ordella.com" className="text-lg font-medium text-primary hover:underline">
          sales@ordella.com
        </a>
      </p>
    </Section>
  );
}
