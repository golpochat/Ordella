import { Check } from 'lucide-react';
import { Badge } from '@shared-ui';
import { cn } from '@/lib/cn';
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/currency';
import { formatPlanPrice, type Plan } from '@/lib/plans';
import { CtaButton } from './cta-button';

type PricingCardProps = {
  plan: Plan;
  currency?: CurrencyCode;
};

export function PricingCard({ plan, currency = DEFAULT_CURRENCY }: PricingCardProps) {
  const isEnterprise = plan.id === 'enterprise';
  const displayPrice = formatPlanPrice(plan, currency);

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border bg-card p-6 shadow-brand transition-shadow hover:shadow-elevated sm:p-7',
        plan.highlighted
          ? 'border-primary shadow-elevated ring-2 ring-primary/15'
          : 'border-border/80',
      )}
    >
      <header>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-h4">{plan.name}</h3>
          {plan.highlighted ? <Badge className="shrink-0">Most popular</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-slate">{plan.description}</p>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
          <span className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{displayPrice}</span>
          {plan.priceDetail ? (
            <span className="text-sm text-slate">{plan.priceDetail}</span>
          ) : null}
        </div>
        <p className="mt-2 text-caption">
          {plan.locations} location{plan.locations !== '1' && plan.locations !== 'Unlimited' ? 's' : ''}{' '}
          · {plan.ordersPerMonth} orders/mo
        </p>
      </header>
      <ul className="mt-6 flex-1 space-y-3 border-t border-border/60 pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-sm text-navy">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <footer className="mt-8">
        {isEnterprise ? (
          <CtaButton href="/contact" variant="outline" className="w-full" utmContent={`pricing_${plan.id}`}>
            {plan.cta}
          </CtaButton>
        ) : (
          <CtaButton
            plan={plan.id === 'free' || plan.id === 'starter' || plan.id === 'pro' ? plan.id : 'free'}
            utmCampaign="pricing"
            utmContent={`pricing_${plan.id}`}
            className="w-full"
            variant={plan.highlighted ? 'default' : 'outline'}
          >
            {plan.cta}
          </CtaButton>
        )}
      </footer>
    </article>
  );
}
