'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Stack } from './layout/stack';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/** ODS field label with optional required indicator. */
export function FormLabel({ className, children, required, ...props }: FormLabelProps) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required ? (
        <>
          <span className="text-destructive" aria-hidden>
            {' '}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
}

export interface FormControlProps {
  children: React.ReactElement;
  error?: boolean;
  disabled?: boolean;
  describedBy?: string;
  invalid?: boolean;
}

type ControlElementProps = {
  id?: string;
  error?: boolean;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  'aria-required'?: boolean;
};

/** Wraps a single input/select/textarea with validation ARIA and error styling props. */
export function FormControl({ children, error, disabled, describedBy, invalid }: FormControlProps) {
  const showInvalid = Boolean(invalid ?? error) && !disabled;

  if (!React.isValidElement(children)) {
    return <div className="min-w-0">{children}</div>;
  }

  const control = React.cloneElement(children as React.ReactElement<ControlElementProps>, {
    error: showInvalid || (children as React.ReactElement<ControlElementProps>).props.error,
    disabled: disabled ?? (children as React.ReactElement<ControlElementProps>).props.disabled,
    'aria-invalid': showInvalid ? true : undefined,
    'aria-describedby': describedBy || (children as React.ReactElement<ControlElementProps>).props['aria-describedby'],
  });

  return <div className="min-w-0">{control}</div>;
}

export interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/** Caption below a control — ODS muted typography. */
export function FormHelperText({ className, children, ...props }: FormHelperTextProps) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export interface FormErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/**
 * Inline field error — reserved min-height prevents layout shift when error appears.
 */
export function FormErrorMessage({ id, className, children, ...props }: FormErrorMessageProps) {
  return (
    <div className="min-h-5" aria-live="polite">
      {children ? (
        <p
          id={id}
          role="alert"
          className={cn('text-xs font-medium text-destructive', className)}
          {...props}
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}

export interface FormSuccessMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/** Optional inline success feedback below a field. */
export function FormSuccessMessage({ id, className, children, ...props }: FormSuccessMessageProps) {
  return (
    <div className="min-h-5" aria-live="polite">
      {children ? (
        <p
          id={id}
          className={cn('text-xs font-medium text-success', className)}
          {...props}
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}

export interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

/** Vertical field stack — label, control, helper, error. */
export function FormItem({ children, className }: FormItemProps) {
  return (
    <Stack gap="sm" className={cn('min-w-0', className)}>
      {children}
    </Stack>
  );
}
