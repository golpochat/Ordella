import * as React from 'react';
import { cn } from '../../lib/utils';
import { Flex } from './flex';
import { Stack } from './stack';

export interface PageHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function PageHeaderTitle({ children, className, ...props }: PageHeaderTitleProps) {
  return (
    <h1
      className={cn(
        'truncate text-xl font-semibold tracking-tight text-foreground min-[769px]:text-2xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function PageHeaderDescription({ children, className, ...props }: PageHeaderDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export interface PageHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageHeaderActions({ children, className, ...props }: PageHeaderActionsProps) {
  return (
    <Flex
      gap="sm"
      wrap
      className={cn('w-full min-[481px]:w-auto min-[481px]:shrink-0 min-[481px]:justify-end', className)}
      {...props}
    >
      {children}
    </Flex>
  );
}

export interface PageHeaderTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageHeaderTabs({ children, className, ...props }: PageHeaderTabsProps) {
  return (
    <div className={cn('mt-4 min-w-0 border-b border-border pb-0', className)} {...props}>
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Filters / search row — renders below title row, above tabs. */
  filters?: React.ReactNode;
  tabs?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  filters,
  tabs,
  children,
  className,
}: PageHeaderProps) {
  if (children) {
    return (
      <header className={cn('min-w-0', className)}>
        {children}
        {filters ? <div className="mt-4 min-w-0">{filters}</div> : null}
        {tabs ? <PageHeaderTabs>{tabs}</PageHeaderTabs> : null}
      </header>
    );
  }

  return (
    <header className={cn('min-w-0', className)}>
      <Flex
        gap="md"
        align="start"
        justify="between"
        className="flex-col min-[769px]:flex-row min-[769px]:items-center"
      >
        <Stack gap="xs" className="min-w-0 flex-1">
          {title ? <PageHeaderTitle>{title}</PageHeaderTitle> : null}
          {description ? <PageHeaderDescription>{description}</PageHeaderDescription> : null}
        </Stack>
        {actions ? <PageHeaderActions>{actions}</PageHeaderActions> : null}
      </Flex>
      {filters ? <div className="mt-4 min-w-0">{filters}</div> : null}
      {tabs ? <PageHeaderTabs>{tabs}</PageHeaderTabs> : null}
    </header>
  );
}
