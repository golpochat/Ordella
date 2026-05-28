import * as React from 'react';
import { cn } from '../../lib/utils';
import { Stack } from './stack';

export interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, description, children, className }: PageSectionProps) {
  return (
    <section className={cn('min-w-0', className)}>
      <Stack gap="md">
        {title ? (
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </Stack>
    </section>
  );
}
