import * as React from 'react';
import { cn } from '../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const controlClass =
  'flex min-h-[8rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50';

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const invalid = Boolean(error) && !disabled;
    return (
      <textarea
        ref={ref}
        className={cn(
          controlClass,
          invalid && 'border-destructive hover:border-destructive focus-visible:ring-destructive',
          className,
        )}
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
