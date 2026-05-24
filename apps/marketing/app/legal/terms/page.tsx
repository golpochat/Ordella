import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Terms of Service',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <Section className="pt-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Placeholder — replace with legal review before public launch.</p>
    </Section>
  );
}
