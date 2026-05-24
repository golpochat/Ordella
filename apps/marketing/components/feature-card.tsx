import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  compact?: boolean;
};

export function FeatureCard({ title, description, icon: Icon, className, compact }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-brand transition-shadow hover:shadow-elevated sm:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-gray-light text-primary',
          compact ? 'h-9 w-9' : 'h-11 w-11',
        )}
        aria-hidden
      >
        <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>
      <h3 className={cn('mt-4 font-semibold text-navy', compact ? 'text-base' : 'text-h4')}>
        {title}
      </h3>
      <p className={cn('mt-2 flex-1 text-slate', compact ? 'text-sm' : 'text-body')}>
        {description}
      </p>
    </div>
  );
}
