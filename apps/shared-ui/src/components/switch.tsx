import * as React from 'react';
import { cn } from '../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id: idProp, error, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = idProp ?? generatedId;
    const invalid = Boolean(error) && !disabled;

    return (
      <div
        className={cn(
          'flex items-start gap-3',
          invalid && 'rounded-md ring-1 ring-destructive/40 ring-offset-2 ring-offset-background',
          className,
        )}
      >
        <label htmlFor={inputId} className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            disabled={disabled}
            aria-invalid={invalid ? true : undefined}
            {...props}
          />
          <span
            className={cn(
              'absolute inset-0 rounded-full bg-muted transition-colors duration-fast ease-default motion-reduce:transition-none',
              'peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            )}
            aria-hidden
          />
          <span
            className={cn(
              'pointer-events-none relative left-0.5 block h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-normal ease-out motion-reduce:transition-none',
              'peer-checked:translate-x-5',
            )}
            aria-hidden
          />
        </label>
        {label ? (
          <div className="grid gap-1 pt-0.5 leading-none">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
        ) : null}
      </div>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
