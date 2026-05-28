'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { IconButton } from './icon-button';
import { odsSearchContainer } from '../lib/motion';
import { Input, type InputProps } from './input';

export interface SearchIconProps {
  className?: string;
}

/** Leading search glyph (16px, muted). */
export function SearchIcon({ className }: SearchIconProps) {
  return <Search className={cn('h-4 w-4 shrink-0 text-muted-foreground', className)} aria-hidden />;
}

export interface SearchClearButtonProps {
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

/** Clear control for search fields — ODS IconButton. */
export function SearchClearButton({
  onClick,
  className,
  'aria-label': ariaLabel = 'Clear search',
}: SearchClearButtonProps) {
  return (
    <IconButton
      type="button"
      size="sm"
      variant="ghost"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn('absolute right-1 top-1/2 -translate-y-1/2', className)}
    >
      <X className="h-4 w-4" aria-hidden />
    </IconButton>
  );
}

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  onClear?: () => void;
  onSearch?: (value: string) => void;
  showClear?: boolean;
  active?: boolean;
  containerClassName?: string;
}

/** ODS search field — 40px height, icon left, optional clear right. */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      defaultValue,
      onChange,
      onClear,
      onSearch,
      onKeyDown,
      showClear = true,
      active,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(String(defaultValue ?? ''));
    const isControlled = value !== undefined;
    const current = isControlled ? String(value) : internal;
    const isActive = active ?? Boolean(current.trim());

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
    };

    const handleClear = () => {
      setValue('');
      onClear?.();
      if (isControlled) {
        onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSearch?.(current);
      }
      onKeyDown?.(event);
    };

    return (
      <div
        className={cn(
          'relative min-w-0 w-full',
          isActive && `rounded-md ring-1 ring-primary/30 ring-offset-2 ring-offset-background ${odsSearchContainer}`,
          containerClassName,
        )}
      >
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          ref={ref}
          type="search"
          data-ods-search=""
          value={isControlled ? value : internal}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={(event) => {
            if (!isControlled) setInternal(event.target.value);
            onChange?.(event);
          }}
          onKeyDown={handleKeyDown}
          className={cn('h-10 pl-9', showClear && current ? 'pr-9' : 'pr-3', className)}
          {...props}
        />
        {showClear && current ? <SearchClearButton onClick={handleClear} /> : null}
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';

export interface SearchBarProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'stretch';
  className?: string;
}

/** Layout wrapper for search — full width mobile; constrained / end-aligned desktop. */
export function SearchBar({ children, align = 'stretch', className }: SearchBarProps) {
  return (
    <Flex
      align="center"
      className={cn(
        'w-full min-w-0 max-w-full',
        align === 'end' && 'min-[769px]:justify-end',
        align === 'stretch' && 'min-[481px]:max-w-md min-[769px]:max-w-sm',
        className,
      )}
    >
      <div className="w-full min-w-0">{children}</div>
    </Flex>
  );
}
