import * as React from 'react';
import { cn } from '../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={invalid ? true : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border-default text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {label ? (
          <div className="grid gap-1 leading-none">
            <label htmlFor={inputId} className="text-sm font-medium text-foreground">
              {label}
            </label>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
        ) : null}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
