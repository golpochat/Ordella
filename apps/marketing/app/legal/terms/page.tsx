import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Terms of Service',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <Section className="pt-6 sm:pt-10" size="sm">
      <div className="mx-auto max-w-prose">
        <PageHero
          title="Terms of Service"
          description="Terms governing use of the Ordella platform and services."
        />
        <p className="mt-10 text-body">
          This page is a draft for pre-launch review. Replace with counsel-approved language before public
          launch.
        </p>
      </div>
    </Section>
  );
}
