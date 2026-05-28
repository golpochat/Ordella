'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  DatePicker,
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterCheckboxItem,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterResetButton,
  FilterSelect,
  FilterSwitchItem,
} from '@shared-ui';
import { FilterSearchInput } from '@/components/ui/admin-search';

export {
  DatePicker,
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterCheckboxItem,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterResetButton,
  FilterSelect,
  FilterSwitchItem,
};

export type AdminFilterBarProps = React.ComponentProps<typeof FilterBar>;

/** Admin alias for ODS FilterBar. */
export const AdminFilterBar = FilterBar;

/** Navigate to pathname without query params (reset filters). */
export function useFilterReset() {
  const router = useRouter();
  const pathname = usePathname();
  return () => router.push(pathname);
}

export { FilterSearchInput };

/** Copy form fields into URLSearchParams (empty values omitted). */
export function paramsFromForm(
  form: HTMLFormElement,
  keys: string[],
  options?: { preserve?: URLSearchParams },
) {
  const formData = new FormData(form);
  const params = new URLSearchParams(options?.preserve?.toString() ?? '');
  for (const key of keys) {
    const value = String(formData.get(key) ?? '').trim();
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params;
}
