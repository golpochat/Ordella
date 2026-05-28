import * as React from 'react';
import { cn } from '../../lib/utils';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormItem,
  FormLabel,
  FormSuccessMessage,
} from '../form-validation';
import { Flex } from './flex';
import { Stack } from './stack';

export interface FormLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Constrain form width to admin settings max (640px). */
  constrained?: boolean;
}

/** Vertical form stack — ODS spacing between sections and fields. */
export function FormLayout({ constrained = true, className, children, ...props }: FormLayoutProps) {
  return (
    <Stack
      gap="lg"
      className={cn(constrained && 'w-full max-w-screen-sm', className)}
      {...props}
    >
      {children}
    </Stack>
  );
}

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Label, control, helper, and error with ODS typography, spacing, and ARIA. */
export function FormField({
  label,
  htmlFor,
  helper,
  error,
  success,
  required,
  children,
  className,
}: FormFieldProps) {
  const helperId = helper ? `${htmlFor}-helper` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const successId = success ? `${htmlFor}-success` : undefined;
  const describedBy = [helperId, errorId, successId].filter(Boolean).join(' ') || undefined;

  const controlChild = React.isValidElement(children) ? children : <>{children}</>;
  const disabled =
    React.isValidElement(children) &&
    Boolean((children as React.ReactElement<{ disabled?: boolean }>).props.disabled);

  return (
    <FormItem className={className}>
      <FormLabel htmlFor={htmlFor} required={required}>
        {label}
      </FormLabel>
      <FormControl
        error={Boolean(error)}
        disabled={disabled}
        describedBy={describedBy}
        invalid={Boolean(error)}
      >
        {React.isValidElement(controlChild)
          ? React.cloneElement(controlChild as React.ReactElement<ControlElementProps>, {
              id: htmlFor,
              'aria-required': required || undefined,
              'aria-describedby': describedBy,
            })
          : controlChild}
      </FormControl>
      {helper ? <FormHelperText id={helperId}>{helper}</FormHelperText> : null}
      <FormErrorMessage id={errorId}>{error}</FormErrorMessage>
      <FormSuccessMessage id={successId}>{success}</FormSuccessMessage>
    </FormItem>
  );
}

type ControlElementProps = {
  id?: string;
  disabled?: boolean;
  'aria-required'?: boolean;
  'aria-describedby'?: string;
};

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

/** Primary/secondary actions below a form — `space-32` separation from fields. */
export function FormActions({ align = 'start', className, children, ...props }: FormActionsProps) {
  return (
    <Flex
      gap="sm"
      wrap
      align="center"
      className={cn(
        'mt-8 w-full',
        align === 'end' && 'justify-end',
        align === 'start' && 'justify-start',
        className,
      )}
      {...props}
    >
      {children}
    </Flex>
  );
}
