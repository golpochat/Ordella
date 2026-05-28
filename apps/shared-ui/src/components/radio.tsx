import * as React from 'react';
import { cn } from '../lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id: idProp, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = idProp ?? generatedId;
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="h-4 w-4 border border-input text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
      </div>
    );
  },
);
Radio.displayName = 'Radio';

export interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  label?: string;
  children: React.ReactNode;
}

export function RadioGroup({ label, children, className, ...props }: RadioGroupProps) {
  return (
    <fieldset className={cn('min-w-0 border-0 p-0', className)} {...props}>
      {label ? <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend> : null}
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

export { Radio };
