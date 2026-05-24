import { cn } from '@/lib/cn';
import { Info, Lightbulb, TriangleAlert } from 'lucide-react';

type CalloutVariant = 'info' | 'warning' | 'tip';

type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
};

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border-primary/30 bg-primary/5 text-navy',
  warning: 'border-warning/40 bg-warning/10 text-navy',
  tip: 'border-success/30 bg-success/10 text-navy',
};

const variantIcons: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warning: TriangleAlert,
  tip: Lightbulb,
};

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const Icon = variantIcons[variant];

  return (
    <aside
      className={cn(
        'my-6 flex gap-3 rounded-xl border p-4 sm:p-5',
        variantStyles[variant],
      )}
      role="note"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-1 font-semibold text-navy">{title}</p> : null}
        <div className="text-body [&>p]:mt-0 [&>p+p]:mt-2">{children}</div>
      </div>
    </aside>
  );
}
