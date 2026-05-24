import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Logo } from '@ordella/ui';

export type OnboardingLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function OnboardingLayout({ children, className }: OnboardingLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-muted/30', className)}>
      <header className="border-b border-border bg-background px-6 py-4">
        <Logo variant="full" size="sm" color="auto" />
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
