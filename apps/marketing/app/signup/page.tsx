import { redirect } from 'next/navigation';
import { appSignupUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = { searchParams: { plan?: string } };

export default function SignupRedirectPage({ searchParams }: Props) {
  const plan = searchParams.plan ?? 'free';
  redirect(appSignupUrl(plan, 'signup_page'));
}
