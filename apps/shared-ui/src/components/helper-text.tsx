import * as React from 'react';
import { FormHelperText } from './form-validation';

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

/** @deprecated Prefer `FormHelperText` inside `FormField`. */
export function HelperText({ id, className, children, ...props }: HelperTextProps) {
  return (
    <FormHelperText id={id} className={className} {...props}>
      {children}
    </FormHelperText>
  );
}
