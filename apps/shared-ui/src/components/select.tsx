import * as React from 'react';
import { cn } from '../lib/utils';
import { odsTransitionColors, odsTransitionFocus } from '../lib/motion';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const controlClass = `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 ${odsTransitionColors} ${odsTransitionFocus}`;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, disabled, children, ...props }, ref) => {
    const invalid = Boolean(error) && !disabled;
    return (
      <select
        ref={ref}
        className={cn(
          controlClass,
          invalid && 'border-destructive hover:border-destructive focus-visible:ring-destructive ods-shake motion-reduce:animate-none',
          className,
        )}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
