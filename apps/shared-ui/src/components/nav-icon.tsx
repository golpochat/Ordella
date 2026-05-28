import * as React from 'react';
import { cn } from '../lib/utils';

export type NavIconProps = {
  icon: React.ReactNode;
  className?: string;
};

/** Standard 20px navigation icon slot (8px grid). */
export function NavIcon({ icon, className }: NavIconProps) {
  return (
    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center text-current', className)}>
      {icon}
    </span>
  );
}
