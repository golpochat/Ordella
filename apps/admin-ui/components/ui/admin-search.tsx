'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import {
  SearchBar,
  SearchClearButton,
  SearchIcon,
  SearchInput,
  type SearchBarProps,
  type SearchInputProps,
} from '@shared-ui';

export { SearchBar, SearchClearButton, SearchIcon, SearchInput };
export type { SearchBarProps, SearchInputProps };

/** Admin alias for ODS SearchBar. */
export const AdminSearchBar = SearchBar;

export type AdminSearchInputProps = SearchInputProps & {
  icon?: LucideIcon;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
};

/** Debounced value for API-driven search (inventory, multi-store, etc.). */
export function useDebouncedSearchValue(value: string, delayMs = 300): string {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Search field with optional debounced callback.
 * @deprecated Prefer `SearchInput` directly; debounce via `useDebouncedSearchValue` in the parent.
 */
export function AdminSearchInput({
  icon: _icon,
  debounceMs,
  onDebouncedChange,
  onChange,
  ...props
}: AdminSearchInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (!debounceMs && onDebouncedChange) {
      onDebouncedChange(event.target.value);
    }
  };

  React.useEffect(() => {
    if (!debounceMs || !onDebouncedChange || props.value === undefined) return;
    const timer = window.setTimeout(() => onDebouncedChange(String(props.value)), debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, onDebouncedChange, props.value]);

  return <SearchInput onChange={handleChange} {...props} />;
}

/** Search aligned to PageHeader actions (right on desktop, full width on mobile). */
export function PageHeaderSearch(props: SearchInputProps) {
  return (
    <SearchBar align="end" className="min-[769px]:ml-auto">
      <SearchInput
        data-ods-page-search=""
        aria-label={props['aria-label'] ?? 'Search'}
        {...props}
      />
    </SearchBar>
  );
}

/** @deprecated Use `SearchInput` — kept for filter migration compatibility. */
export function FilterSearchInput(props: SearchInputProps) {
  return <SearchInput {...props} />;
}
