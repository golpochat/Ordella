import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Privacy Policy',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <Section className="pt-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Placeholder — replace with legal review before public launch.</p>
      <p className="mt-4 text-sm text-muted-foreground">
        We collect account and usage data to operate the Ordella platform. Analytics cookies are used on this
        marketing site when you accept the cookie banner.
      </p>
    </Section>
  );
}
