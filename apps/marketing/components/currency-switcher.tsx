'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { currencySymbols, type CurrencyCode } from '@/lib/currency';

const CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'USD'];

type CurrencySwitcherProps = {
  active: CurrencyCode;
  className?: string;
};

export function CurrencySwitcher({ active, className }: CurrencySwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div
      className={cn('inline-flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm', className)}
      role="group"
      aria-label="Display currency"
    >
      {CURRENCIES.map((code) => {
        const isActive = code === active;
        const params = new URLSearchParams(searchParams.toString());
        if (code === 'EUR') {
          params.delete('currency');
        } else {
          params.set('currency', code);
        }
        const query = params.toString();
        const href = query ? `${pathname}?${query}` : pathname;

        return (
          <Link
            key={code}
            href={href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-slate hover:bg-gray-light hover:text-navy',
            )}
            aria-current={isActive ? 'true' : undefined}
          >
            {currencySymbols[code]} {code}
          </Link>
        );
      })}
    </div>
  );
}
