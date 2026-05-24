import { cn } from '../../lib/utils';

export type ProgressStep = {
  id: string;
  label: string;
};

export type ProgressIndicatorProps = {
  steps: ProgressStep[];
  currentStepId: string;
  className?: string;
};

export function ProgressIndicator({ steps, currentStepId, className }: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <nav aria-label="Onboarding progress" className={cn('mb-8', className)}>
      <ol className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStepId;
          return (
            <li
              key={step.id}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                isComplete && 'bg-primary/15 text-primary',
                isCurrent && 'bg-primary text-primary-foreground',
                !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
              )}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
