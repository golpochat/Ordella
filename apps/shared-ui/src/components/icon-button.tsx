import * as React from 'react';
import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './button';

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  'aria-label': string;
  size?: 'sm' | 'md';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={cn(size === 'sm' ? 'h-8 w-8' : 'h-10 w-10', className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = 'IconButton';
