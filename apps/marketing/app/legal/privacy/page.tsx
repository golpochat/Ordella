import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Privacy Policy',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <Section className="pt-6 sm:pt-10" size="sm">
      <div className="mx-auto max-w-prose">
        <PageHero
          title="Privacy Policy"
          description="How Ordella collects and uses data on this marketing site and platform."
        />
        <div className="mt-10 space-y-4 text-body">
          <p>
            We collect account and usage data to operate the Ordella platform. Analytics cookies are used on
            this marketing site when you accept the cookie banner.
          </p>
          <p>
            This page is a draft for pre-launch review. Replace with counsel-approved language before public
            launch.
          </p>
        </div>
      </div>
    </Section>
  );
}
