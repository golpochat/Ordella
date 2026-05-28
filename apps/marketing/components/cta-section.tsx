import Link from 'next/link';
import { Button } from '@shared-ui';
import { cn } from '@/lib/cn';
import type { UtmCampaign } from '@/lib/signup-url';
import { CtaButton } from './cta-button';

type CtaSectionProps = {
  title: string;
  subtitle?: string;
  utmCampaign: UtmCampaign;
  utmContent: string;
  plan?: 'free' | 'starter' | 'pro';
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  variant?: 'brand' | 'default';
  align?: 'left' | 'center';
};

export function CtaSection({
  title,
  subtitle,
  utmCampaign,
  utmContent,
  plan = 'free',
  secondaryHref = '/contact',
  secondaryLabel = 'Talk to sales',
  className,
  variant = 'brand',
  align = 'left',
}: CtaSectionProps) {
  const isBrand = variant === 'brand';
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'rounded-2xl px-6 py-10 shadow-sm sm:px-10 sm:py-14',
        isBrand ? 'bg-primary text-primary-foreground' : 'border border-border bg-card',
        centered && 'text-center',
        className,
      )}
    >
      <h2 className={cn('text-h2', isBrand && 'text-inherit')}>{title}</h2>
      {subtitle ? (
        <p
          className={cn(
            'text-body-lg mt-4',
            centered && 'mx-auto max-w-2xl',
            isBrand ? 'text-primary-foreground/90' : 'text-slate',
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <div
        className={cn(
          'mt-8 flex flex-wrap gap-3',
          centered ? 'justify-center' : 'justify-start',
        )}
      >
        <CtaButton
          size="lg"
          plan={plan}
          utmCampaign={utmCampaign}
          utmContent={utmContent}
          className={isBrand ? 'bg-background text-navy hover:bg-background/90' : undefined}
        >
          Start free trial
        </CtaButton>
        <Button
          asChild
          size="lg"
          variant="outline"
          className={
            isBrand
              ? 'border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10'
              : undefined
          }
        >
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
