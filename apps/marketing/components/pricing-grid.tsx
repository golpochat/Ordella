import Link from 'next/link';
import { PricingCard } from './pricing-card';
import type { CurrencyCode } from '@/lib/currency';
import type { Plan } from '@/lib/plans';

type PricingGridProps = {
  plans: Plan[];
  currency?: CurrencyCode;
  compareHref?: string;
  compareLabel?: string;
  className?: string;
};

export function PricingGrid({
  plans,
  currency,
  compareHref,
  compareLabel = 'Compare all plans →',
  className,
}: PricingGridProps) {
  return (
    <div className={className}>
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} currency={currency} />
        ))}
      </div>
      {compareHref ? (
        <p className="mt-8 text-center">
          <Link
            href={compareHref}
            className="text-sm font-semibold text-primary transition-colors hover:underline"
          >
            {compareLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
