import { cn } from '../../lib/utils';

export type StepHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function StepHeader({ title, description, className }: StepHeaderProps) {
  return (
    <div className={cn('mb-6 space-y-2', className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
