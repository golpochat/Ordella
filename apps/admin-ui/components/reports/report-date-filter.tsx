'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterResetButton,
  paramsFromForm,
  useFilterReset,
} from '@/components/ui/admin-filter';

export function ReportDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reset = useFilterReset();

  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = paramsFromForm(e.currentTarget, ['from', 'to'], { preserve: searchParams });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <FilterBar onSubmit={onSubmit}>
      <DateRangePicker
        fromId="report-from"
        toId="report-to"
        fromDefaultValue={from}
        toDefaultValue={to}
        fromActive={Boolean(from)}
        toActive={Boolean(to)}
      />
      <FilterActions>
        <FilterApplyButton>Apply range</FilterApplyButton>
        <FilterResetButton type="button" onClick={reset}>
          Clear
        </FilterResetButton>
      </FilterActions>
    </FilterBar>
  );
}
