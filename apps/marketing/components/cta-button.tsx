import Link from 'next/link';
import { Button, type ButtonProps } from '@shared-ui';
import { appSignupUrl } from '@/lib/site';

type CtaButtonProps = {
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
  utmContent?: string;
  href?: string;
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
};

export function CtaButton({
  plan = 'free',
  utmContent,
  href,
  children,
  variant = 'default',
  size = 'default',
  className,
}: CtaButtonProps) {
  const target = href ?? appSignupUrl(plan, utmContent);

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={target}>{children}</Link>
    </Button>
  );
}
