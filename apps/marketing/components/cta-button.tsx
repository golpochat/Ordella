import Link from 'next/link';
import { Button, type ButtonProps } from '@shared-ui';
import { buildSignupUrl, type SignupPlan, type UtmCampaign } from '@/lib/signup-url';

type CtaButtonProps = {
  plan?: SignupPlan;
  utmCampaign?: UtmCampaign;
  utmContent?: string;
  href?: string;
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
};

export function CtaButton({
  plan = 'free',
  utmCampaign = 'landing',
  utmContent,
  href,
  children,
  variant = 'default',
  size = 'default',
  className,
}: CtaButtonProps) {
  const target =
    href ??
    buildSignupUrl({
      plan,
      campaign: utmCampaign,
      content: utmContent,
    });

  const isExternal = target.startsWith('http://') || target.startsWith('https://');

  return (
    <Button asChild variant={variant} size={size} className={className}>
      {isExternal ? (
        <a href={target}>{children}</a>
      ) : (
        <Link href={target}>{children}</Link>
      )}
    </Button>
  );
}
