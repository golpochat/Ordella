'use client';

import { useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultAnalyticsRange } from '@/lib/api/admin/analytics';
import {
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterItem,
  FilterResetButton,
  FilterSelect,
  paramsFromForm,
  useFilterReset,
} from '@/components/ui/admin-filter';

type AnalyticsFiltersProps = {
  locations: { id: string; name: string }[];
};

export function AnalyticsFilters({ locations }: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useFilterReset();
  const defaults = defaultAnalyticsRange();
  const locationId = useId();

  const from = searchParams.get('from') ?? defaults.from;
  const to = searchParams.get('to') ?? defaults.to;
  const activeLocation = searchParams.get('locationId') ?? '';

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = paramsFromForm(event.currentTarget, ['from', 'to', 'locationId']);
    if (!params.get('from')) params.set('from', defaults.from);
    if (!params.get('to')) params.set('to', defaults.to);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <FilterBar onSubmit={onSubmit}>
      <DateRangePicker
        fromId="analytics-from"
        toId="analytics-to"
        fromDefaultValue={from}
        toDefaultValue={to}
        fromActive={Boolean(from)}
        toActive={Boolean(to)}
      />
      {locations.length > 1 ? (
        <FilterItem label="Location" htmlFor={locationId} active={Boolean(activeLocation)}>
          <FilterSelect id={locationId} name="locationId" defaultValue={activeLocation}>
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </FilterSelect>
        </FilterItem>
      ) : null}
      <FilterActions>
        <FilterApplyButton>Apply</FilterApplyButton>
        <FilterResetButton type="button" onClick={reset}>
          Reset
        </FilterResetButton>
      </FilterActions>
    </FilterBar>
  );
}
