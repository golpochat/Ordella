'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormItem,
  FormLabel,
  FormSuccessMessage,
  type AlertProps,
  type FormFieldProps,
} from '@shared-ui';

export {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormItem,
  FormLabel,
  FormSuccessMessage,
};
export type { AlertProps, FormFieldProps };

export type FormErrorAlertProps = {
  message?: string | null;
  title?: string;
  className?: string;
};

/** Form-level error banner — appears above fields, uses ODS Alert error styling. */
export function FormErrorAlert({ message, title = 'Unable to save', className }: FormErrorAlertProps) {
  if (!message) return null;
  return (
    <Alert variant="error" className={className}>
      <AlertContent variant="error" title={title}>
        {message}
      </AlertContent>
    </Alert>
  );
}

export type FormSuccessAlertProps = {
  message?: string | null;
  title?: string;
  className?: string;
};

/** Form-level success feedback (e.g. after inline save). */
export function FormSuccessAlert({ message, title, className }: FormSuccessAlertProps) {
  if (!message) return null;
  return (
    <Alert variant="success" className={className}>
      <AlertContent variant="success" title={title}>
        {message}
      </AlertContent>
    </Alert>
  );
}

export type FieldValidator = (value: string) => string | undefined;

export type UseFormFieldValidationOptions = {
  /** Validate all fields — call on submit. */
  validateOnSubmit?: () => Record<string, string | undefined>;
};

/**
 * Field validation state — errors surface on blur or submit, not on every keystroke.
 */
export function useFormFieldValidation(initialErrors: Record<string, string> = {}) {
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const markSubmitted = useCallback(() => {
    setSubmitted(true);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, []);

  const setFieldError = useCallback((name: string, message: string | undefined) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }, []);

  const getFieldError = useCallback(
    (name: string) => {
      if (!touched[name] && !submitted) return undefined;
      return errors[name];
    },
    [errors, submitted, touched],
  );

  const touchField = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const fieldProps = useCallback(
    (name: string, validate?: FieldValidator) => ({
      error: getFieldError(name),
      onBlur: (value?: string) => {
        touchField(name);
        if (validate && value !== undefined) {
          setFieldError(name, validate(value));
        }
      },
      validateValue: (value: string) => {
        if (!validate) return;
        setFieldError(name, validate(value));
      },
    }),
    [getFieldError, setFieldError, touchField],
  );

  const applySubmitErrors = useCallback((next: Record<string, string | undefined>) => {
    setSubmitted(true);
    const compact: Record<string, string> = {};
    for (const [key, value] of Object.entries(next)) {
      if (value) compact[key] = value;
    }
    setErrors(compact);
    return Object.keys(compact).length === 0;
  }, []);

  return {
    errors,
    touched,
    submitted,
    markSubmitted,
    clearErrors,
    setFieldError,
    getFieldError,
    fieldProps,
    applySubmitErrors,
  };
}
