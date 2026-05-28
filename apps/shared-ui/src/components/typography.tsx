import * as React from 'react';
import { cn } from '../lib/utils';
import { FormLabel } from './form-validation';

const headingSizeClass: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'text-sm font-semibold leading-snug tracking-normal text-foreground',
  sm: 'text-base font-semibold leading-snug tracking-normal text-foreground',
  md: 'text-lg font-semibold leading-tight tracking-tight text-foreground',
  lg: 'text-2xl font-semibold leading-tight tracking-tight text-foreground',
  xl: 'text-3xl font-semibold leading-tight tracking-tight text-foreground',
};

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const legacySizeByLevel: Record<NonNullable<HeadingProps['level']>, NonNullable<HeadingProps['size']>> = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
  5: 'xs',
  6: 'xs',
};

export function Heading({ level = 3, size, className, children, ...props }: HeadingProps) {
  const Tag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  const resolvedSize = size ?? legacySizeByLevel[level];
  return (
    <Tag className={cn(headingSizeClass[resolvedSize], className)} {...props}>
      {children}
    </Tag>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'success' | 'destructive' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  as?: 'p' | 'span';
}

const textSizeClass: Record<NonNullable<TextProps['size']>, string> = {
  sm: 'text-sm leading-normal',
  md: 'text-base leading-normal',
  lg: 'text-lg leading-relaxed',
};

const textVariantClass: Record<NonNullable<TextProps['variant']>, string> = {
  default: 'text-foreground',
  success: 'font-semibold tabular-nums text-success',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
};

export function Text({ variant = 'default', size = 'md', as: Component = 'p', className, children, ...props }: TextProps) {
  return (
    <Component className={cn(textSizeClass[size], textVariantClass[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export interface TextMutedProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span';
}

export function TextMuted({ as: Component = 'p', className, children, ...props }: TextMutedProps) {
  return (
    <Component className={cn('text-sm leading-normal text-muted-foreground', className)} {...props}>
      {children}
    </Component>
  );
}

export interface TextStrongProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'p';
}

export function TextStrong({ as: Component = 'span', className, children, ...props }: TextStrongProps) {
  return (
    <Component className={cn('text-sm font-semibold leading-normal text-foreground', className)} {...props}>
      {children}
    </Component>
  );
}

export type LabelProps = React.ComponentProps<typeof FormLabel>;

/** ODS label alias for form fields. */
export function Label(props: LabelProps) {
  return <FormLabel {...props} />;
}
