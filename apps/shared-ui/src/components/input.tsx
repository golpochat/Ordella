import * as React from 'react';
import { cn } from '../lib/utils';
import { odsTransitionColors, odsTransitionFocus } from '../lib/motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, disabled, ...props }, ref) => {
  const invalid = Boolean(error) && !disabled;
  return (
    <input
      type={type}
      className={cn(
        `flex h-10 w-full rounded-md border border-border-default bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 ${odsTransitionColors} ${odsTransitionFocus}`,
        invalid && 'border-destructive hover:border-destructive focus-visible:ring-destructive ods-shake motion-reduce:animate-none',
        className,
      )}
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid ? true : undefined}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
