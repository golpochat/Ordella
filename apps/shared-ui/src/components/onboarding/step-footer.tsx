import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../button';

export type StepFooterProps = {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  trailing?: ReactNode;
  className?: string;
};

export function StepFooter({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  nextDisabled,
  loading,
  trailing,
  className,
}: StepFooterProps) {
  return (
    <div
      className={cn(
        'mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6',
        className,
      )}
    >
      <div>
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            {backLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {trailing}
        {onNext ? (
          <Button type="button" onClick={onNext} disabled={nextDisabled || loading}>
            {loading ? 'Saving…' : nextLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
