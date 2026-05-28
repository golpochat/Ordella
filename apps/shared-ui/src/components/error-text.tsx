import * as React from 'react';
import { FormErrorMessage } from './form-validation';

export interface ErrorTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/** @deprecated Prefer `FormErrorMessage` inside `FormField`. */
export function ErrorText({ id, className, children, ...props }: ErrorTextProps) {
  return (
    <FormErrorMessage id={id} className={className} {...props}>
      {children}
    </FormErrorMessage>
  );
}
