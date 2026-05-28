import { cn } from '../../lib/utils';
import { Stack, type StackProps } from './stack';

export interface ContentAreaProps extends Omit<StackProps, 'gap'> {
  /** Vertical rhythm between page blocks (header → filters → content). */
  gap?: StackProps['gap'];
  /** Optional max-width constraint (`lg` = 1280px centered). Admin tables typically use `none`. */
  maxWidth?: 'none' | 'lg';
}

const maxWidthClass = {
  none: 'max-w-none',
  lg: 'max-w-7xl mx-auto w-full',
} as const;

/**
 * Primary page content column — vertical stack with ODS spacing tokens.
 * Lives inside PageContainer (main landmark).
 */
export function ContentArea({
  gap = 'lg',
  maxWidth = 'none',
  className,
  children,
  ...props
}: ContentAreaProps) {
  return (
    <Stack
      gap={gap}
      className={cn('min-w-0 w-full', maxWidthClass[maxWidth], className)}
      {...props}
    >
      {children}
    </Stack>
  );
}
