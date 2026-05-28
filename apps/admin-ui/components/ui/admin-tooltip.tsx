'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  IconButton,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipHint,
  TooltipProvider,
  TooltipTrigger,
  type TooltipContentProps,
  type TooltipProps,
} from '@shared-ui';

export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipHint,
  TooltipProvider,
  TooltipTrigger,
};
export type { TooltipContentProps, TooltipProps };

/** Admin alias for ODS TooltipProvider — mount once in `theme-root.tsx`. */
export const AdminTooltipProvider = TooltipProvider;

/** Icon-only control with accessible name + hover/focus tooltip. */
export function IconTooltip({
  label,
  children,
  side = 'top',
  contentClassName,
}: {
  label: string;
  children: React.ReactElement;
  side?: TooltipContentProps['side'];
  contentClassName?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className={contentClassName}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/** Form field help — info icon with multi-line tooltip. */
export function FormFieldHelpTooltip({
  content,
  label = 'Field help',
}: {
  content: React.ReactNode;
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton type="button" size="sm" variant="ghost" aria-label={label}>
          <HelpCircle className="h-4 w-4" aria-hidden />
        </IconButton>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm whitespace-normal text-left font-normal leading-snug">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

/** Table column header with optional definition tooltip. */
export function TableHeaderTooltip({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children ?? (
          <span className="inline-flex cursor-help items-center gap-1 border-b border-dotted border-muted-foreground/50">
            {label}
            <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs whitespace-normal font-normal leading-snug">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

/** Status / info icon with explanatory tooltip. */
export function InfoTooltip({
  content,
  label = 'More information',
  side = 'top',
}: {
  content: React.ReactNode;
  label?: string;
  side?: TooltipContentProps['side'];
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton type="button" size="sm" variant="ghost" aria-label={label}>
          <HelpCircle className="h-4 w-4" aria-hidden />
        </IconButton>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm whitespace-normal font-normal leading-snug">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
