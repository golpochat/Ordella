import { redirect } from 'next/navigation';
import { buildSignupUrl, normalizeSignupPlan, normalizeUtmCampaign } from '@/lib/signup-url';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignupRedirectPage({ searchParams }: Props) {
  const plan = normalizeSignupPlan(first(searchParams.plan));
  const campaign = normalizeUtmCampaign(first(searchParams.utm_campaign) ?? 'signup');
  const content = first(searchParams.utm_content) ?? 'signup_page';

  redirect(
    buildSignupUrl({
      plan,
      campaign,
      content,
    }),
  );
}
