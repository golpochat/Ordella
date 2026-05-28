'use client';

import { useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterItem,
  FilterResetButton,
  paramsFromForm,
  useFilterReset,
} from '@/components/ui/admin-filter';
import { SearchInput } from '@/components/ui/admin-search';

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useFilterReset();
  const searchId = useId();

  const search = searchParams.get('search') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = paramsFromForm(e.currentTarget, ['search', 'from', 'to']);
    router.push(`?${params.toString()}`);
  }

  return (
    <FilterBar className="mb-4" onSubmit={onSubmit}>
      <FilterItem label="Search" htmlFor={searchId} active={Boolean(search)} className="min-[481px]:max-w-sm">
        <SearchInput
          id={searchId}
          name="search"
          placeholder="Search SKU or name"
          defaultValue={search}
          active={Boolean(search)}
          aria-label="Search inventory"
        />
      </FilterItem>
      <DateRangePicker
        fromId="inventory-from"
        toId="inventory-to"
        fromDefaultValue={from}
        toDefaultValue={to}
        fromActive={Boolean(from)}
        toActive={Boolean(to)}
      />
      <FilterActions>
        <FilterApplyButton>Apply</FilterApplyButton>
        <FilterResetButton type="button" onClick={reset}>
          Clear
        </FilterResetButton>
      </FilterActions>
    </FilterBar>
  );
}
